// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./ICore.sol";
import "./Xlpt.sol";
import "./Randomizer.sol";
import "./Swapper.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

abstract contract CoreBase is ICore, Randomizer, Swapper {
    IXlpt internal _xexp;

    uint256 internal constant MICRO_WITHDRAW_FEE = 1e3; // 0.1%
    uint256 internal constant RAND_MAX = 2 ** 128;
    uint256 internal constant M = 1e6;
    uint256 internal constant XEXP_TO_USD_RATE = 10;
    uint256 internal XEXP_UNIT = 0;

    uint256 internal constant MAINTAINER_SHARE = 10;
    uint256 internal constant DONATION_SHARE = 10;
    uint256 internal constant POOL_SHARE = 10;
    uint256 internal constant PLAYER_SHARE = 70;
    uint256 internal constant TOTAL_SHARE = 100;

    PlayStatus[] internal playStatuses;
    ProbabilityTable[] internal probabilityTables;
    mapping(address => uint256[]) internal address2PlayIds;
    mapping(uint256 => uint256) internal requestId2PlayId;

    mapping(address => uint256) internal playTimesByToken;
    mapping(address => uint256) internal playAmountsByToken;

    address internal donation = address(0);

    constructor(address _addr_xexp) {
        _xexp = IXlpt(_addr_xexp);
        XEXP_UNIT = 10 ** IERC20Metadata(_addr_xexp).decimals();
        donation = msg.sender;
    }

    function setDonation(address _donation) external override onlyMaintainer {
        donation = _donation;
        emit DonationSet(_donation);
    }

    function getTokenStatistics(
        address token
    ) external view override returns (uint256 playTimes, uint256 playAmounts) {
        return (playTimesByToken[token], playAmountsByToken[token]);
    }

    function deposit(
        address tokenAddress,
        uint256 tokenAmount
    ) external override returns (uint256 lpAmount) {
        address lpAddress = getLp(tokenAddress);
        lpAmount = IXlpt(lpAddress).token2LpAmount(tokenAmount);

        // mint lpt and transfer token to core
        IXlpt(lpAddress).mint(tx.origin, lpAmount);
        TransferHelper.safeTransferFrom(
            tokenAddress,
            tx.origin,
            address(this),
            tokenAmount
        );
        emit TokenDeposited(tokenAddress, tokenAmount, lpAmount, tx.origin);
    }

    function withdraw(
        address tokenAddress,
        uint256 lpAmount
    ) external override returns (uint256 tokenAmount) {
        address lpAddress = getLp(tokenAddress);
        tokenAmount = IXlpt(lpAddress).lp2TokenAmount(lpAmount);
        require(
            lpAmount <= IERC20(lpAddress).balanceOf(tx.origin),
            "Xlpt: lpAmount exceeds owner balance"
        );

        // burn lpt and transfer token to sender
        IXlpt(lpAddress).burn(tx.origin, lpAmount);
        uint256 withdrawFee = (tokenAmount * MICRO_WITHDRAW_FEE) / M;
        tokenAmount -= withdrawFee;
        TransferHelper.safeTransfer(tokenAddress, maintainer(), withdrawFee);
        TransferHelper.safeTransfer(tokenAddress, tx.origin, tokenAmount);
        emit TokenWithdrawn(tokenAddress, lpAmount, tokenAmount, tx.origin);
    }

    function verifyTable(ProbabilityTable calldata table) internal pure {
        // check formats
        require(
            table.relatives.length >= 1,
            "Core: must have at least one branch"
        );
        require(
            table.relatives.length <= 10,
            "Core: must have at most 10 branches"
        );
        require(
            table.relatives.length == table.mExpectations.length &&
                table.relatives.length == table.mRewards.length,
            "Core: relatives, expectations, rewards must have equal lengths"
        );

        // check probabilities
        uint256 mExpectationSum = 0;
        uint256 mProbSum = 0;
        for (uint256 i = 0; i < table.relatives.length; ++i) {
            mExpectationSum += table.mExpectations[i];
            require(table.mExpectations[i] > 0, "Core: expectation must > 0");
            require(
                mExpectationSum <= 7e5,
                "Core: expectation sum must <= 7e5 (70%)"
            );

            require(table.mRewards[i] > 0, "Core: reward must > 0");
            if (table.relatives[i] == 0) {
                require(
                    table.mRewards[i] <= 1e5,
                    "Core: reward relative to pool must <= 1e5 (10%)"
                );
            } else if (table.relatives[i] == 1) {
                mProbSum += (M * table.mExpectations[i]) / table.mRewards[i];
                // ignore relative-to-pool since it's dynamic
            }
        }

        require(mProbSum <= 1e6, "Core: probability sum must <= 1e6 (100%)");
    }

    function consumeToken(
        address inputToken,
        uint256 inputAmount,
        uint256 repeats
    ) internal {
        require(inputAmount > 0, "Core: inputAmount is zero");
        require(
            inputAmount >= getLowerBound(inputToken),
            "Core: inputAmount is below lower bound"
        );
        require(repeats > 0, "Core: repeats is zero");
        TransferHelper.safeTransferFrom(
            inputToken,
            msg.sender,
            address(this),
            inputAmount * repeats
        );
    }

    function shareToken(
        address player,
        address inputToken,
        uint256 totalAmount
    )
        internal
        returns (
            uint256 maintainerAmount,
            uint256 donationAmount,
            uint256 remainingAmount,
            uint256 outputXexpAmount
        )
    {
        // mint xexp to player
        outputXexpAmount =
            (totalAmount * XEXP_TO_USD_RATE * XEXP_UNIT) /
            (10 ** ERC20(inputToken).decimals());
        _xexp.mint(player, outputXexpAmount);

        // transfer 10% inputToken to maintainer
        maintainerAmount = (totalAmount * MAINTAINER_SHARE) / TOTAL_SHARE;
        TransferHelper.safeTransfer(inputToken, maintainer(), maintainerAmount);

        // transfer 10% inputToken to donation
        donationAmount = (totalAmount * DONATION_SHARE) / TOTAL_SHARE;
        TransferHelper.safeTransfer(inputToken, donation, donationAmount);

        // 80% remaining
        remainingAmount = totalAmount - maintainerAmount - donationAmount;
    }

    function play(
        address player,
        address inputToken,
        uint256 inputAmount,
        uint256 repeats,
        address outputToken,
        ProbabilityTable calldata table
    ) external override returns (uint256 playId) {
        // 0. verify table and transfer input token
        playId = playStatuses.length;
        verifyTable(table);
        consumeToken(inputToken, inputAmount, repeats);
        playTimesByToken[inputToken] += repeats;
        playAmountsByToken[inputToken] += inputAmount * repeats;

        // 1. share input token and give xexp
        (
            uint256 maintainerAmount,
            uint256 donationAmount,
            uint256 remainingAmount,
            uint256 outputXexpAmount
        ) = shareToken(player, inputToken, inputAmount * repeats);

        // 2. swap and fund
        uint256 outputTotalAmount = (swapAndFund(
            inputToken,
            remainingAmount,
            outputToken
        ) * PLAYER_SHARE) / (POOL_SHARE + PLAYER_SHARE); // default 70% to player

        // 3. request randomness
        uint256 requestId = requestRandomness();
        requestId2PlayId[requestId] = playId;
        address2PlayIds[player].push(playId);

        playStatuses.push(
            PlayStatus({
                fulfilled: false,
                playId: playId,
                blockNumber: block.number,
                blockTimestamp: block.timestamp,
                player: player,
                inputToken: inputToken,
                inputAmount: inputAmount,
                repeats: repeats,
                outputToken: outputToken,
                requestId: requestId,
                tableTag: table.tag,
                randomWord: 0,
                outcomeLevels: new uint256[](0),
                outputTotalAmount: outputTotalAmount,
                outputXexpAmount: outputXexpAmount
            })
        );
        probabilityTables.push(table);

        emit PlayRequested(
            playStatuses[playId],
            maintainerAmount,
            donationAmount
        );

        // 4. post play
        postPlay(playStatuses[playId]);
    }

    function listPlayIds(
        address player
    ) external view override returns (uint256[] memory playIds) {
        return address2PlayIds[player];
    }

    function getPlayStatusById(
        uint256 playId
    ) external view override returns (PlayStatus memory status) {
        require(playId < playStatuses.length, "Core: play not found");
        return playStatuses[playId];
    }

    function getProbabilityTableById(
        uint256 playId
    ) external view override returns (ProbabilityTable memory table) {
        require(playId < probabilityTables.length, "Core: table not found");
        return probabilityTables[playId];
    }

    function fulfillRandomness(
        uint256 requestId,
        uint256 randomness
    ) internal override {
        fulfillPlay(requestId, randomness);
    }

    function fulfillPlay(uint256 requestId, uint256 randomness) internal {
        PlayStatus storage status = playStatuses[requestId2PlayId[requestId]];
        require(!status.fulfilled, "Core: already fulfilled");
        require(status.requestId == requestId, "Core: requestId mismatch");

        uint256 rewardTotalAmount = 0;
        uint256 outputOnceAmount = ((status.outputTotalAmount /
            status.repeats) * TOTAL_SHARE) / PLAYER_SHARE; // recover total amount from player share
        status.randomWord = randomness;
        status.fulfilled = true;

        // do randomizing only if reward is valid
        if (rewardVerify(status.outputToken, outputOnceAmount, status.playId)) {
            uint256 level = 0;
            uint256 reward = 0;

            for (uint256 i = 0; i < status.repeats; ++i) {
                (level, reward, randomness) = rewardCalculate(
                    status.outputToken,
                    outputOnceAmount,
                    randomness,
                    status.playId
                );
                rewardTotalAmount += reward;
                status.outcomeLevels.push(level);
            }

            status.outputTotalAmount = rewardTotalAmount;
        }

        TransferHelper.safeTransfer(
            status.outputToken,
            status.player,
            status.outputTotalAmount
        );

        emit PlayFulfilled(status);
    }

    function rewardVerify(
        address token,
        uint256 amount,
        uint256 playId
    ) internal view returns (bool valid) {
        ProbabilityTable storage table = probabilityTables[playId];
        uint256 poolAmount = IERC20(token).balanceOf(address(this));
        uint256 mReward = 0;
        uint256 mProbSum = 0;
        for (uint256 i = 0; i < table.relatives.length; ++i) {
            if (table.relatives[i] == 0) {
                // reward is relative to pool amount
                mReward = table.mRewards[i] * poolAmount;
            } else if (table.relatives[i] == 1) {
                // reward is relative to input amount
                mReward = table.mRewards[i] * amount;
            }

            mProbSum += (M * table.mExpectations[i] * amount) / mReward;
            if (mReward > (M * poolAmount) / 10) {
                // pool size must be at least 10x the reward
                return false;
            }
        }

        // pool size is too small such that the probability sum > 100%
        return mProbSum <= M;
    }

    function rewardCalculate(
        address token,
        uint256 amount,
        uint256 randomness,
        uint256 playId
    )
        internal
        view
        returns (uint256 level, uint256 reward, uint256 newRandomness)
    {
        ProbabilityTable storage table = probabilityTables[playId];
        uint256 p = randomness % RAND_MAX;
        uint256 poolAmount = IERC20(token).balanceOf(address(this));
        uint256 upper = 0;
        uint256 target = 0;
        newRandomness = uint256(
            keccak256(abi.encodePacked(randomness, block.number))
        );

        for (uint256 i = 0; i < table.relatives.length; ++i) {
            target = table.relatives[i] == 0
                ? (table.mRewards[i] * poolAmount) / M
                : (table.mRewards[i] * amount) / M;

            upper +=
                (RAND_MAX / target) *
                ((amount * table.mExpectations[i]) / M);

            if (p < upper) {
                return (i, Math.min(target, poolAmount / 10), newRandomness);
            }
        }

        return (table.relatives.length, 0, newRandomness);
    }

    receive() external payable {}

    // virtual functions to be implemented by derived contracts

    function swapAndFund(
        address inputToken,
        uint256 inputAmount,
        address outputToken
    ) internal virtual returns (uint256 outputAmount);

    function postPlay(PlayStatus storage status) internal virtual {}
}
