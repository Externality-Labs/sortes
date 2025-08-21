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

    uint256 internal constant TEN_PERCENT_SHARE = 10;
    uint256 internal constant POOL_SHARE = 10;
    uint256 internal constant PLAYER_SHARE = 70;
    uint256 internal constant TOTAL_SHARE = 100;

    PlayStatus[] internal playStatuses;
    ProbabilityTable[] internal mtTables;
    mapping(address => uint256[]) internal address2PlayIds;
    mapping(uint256 => uint256) internal requestId2PlayId;

    uint256 internal nextWithdrawId = 1;
    mapping(address => WithdrawRequest) internal address2WithdrawRequest;

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
        IXlpt(lpAddress).mint(msg.sender, lpAmount);
        TransferHelper.safeTransferFrom(
            tokenAddress,
            msg.sender,
            address(this),
            tokenAmount
        );
        emit TokenDeposited(tokenAddress, tokenAmount, lpAmount, msg.sender);
    }

    function requestWithdraw(
        address tokenAddress,
        uint256 lpAmount
    ) external override {
        address lpAddress = getLp(tokenAddress);
        require(lpAmount > 0, "Core: lpAmount is zero");
        require(
            lpAmount <= IERC20(lpAddress).balanceOf(msg.sender),
            "Core: insufficient lp balance"
        );

        uint256 feeLpAmount = (lpAmount * MICRO_WITHDRAW_FEE) / M;
        uint256 feeTokenAmount = 0;
        if (feeLpAmount > 0) {
            feeTokenAmount = IXlpt(lpAddress).lp2TokenAmount(feeLpAmount);
            IXlpt(lpAddress).burn(msg.sender, feeLpAmount);
            TransferHelper.safeTransfer(
                tokenAddress,
                maintainer(),
                feeTokenAmount
            );
        }

        address2WithdrawRequest[msg.sender] = WithdrawRequest({
            withdrawId: nextWithdrawId++,
            tokenAddress: tokenAddress,
            lpAmount: lpAmount,
            timestamp: block.timestamp,
            feeLpAmount: feeLpAmount,
            feeTokenAmount: feeTokenAmount,
            user: msg.sender
        });

        emit TokenWithdrawRequested(address2WithdrawRequest[msg.sender]);
    }

    function executeWithdraw() external override {
        WithdrawRequest storage request = address2WithdrawRequest[msg.sender];
        require(request.withdrawId > 0, "Core: no withdrawal request found");
        require(
            block.timestamp > request.timestamp,
            "Core: withdrawal request not yet available"
        );
        require(
            block.timestamp - request.timestamp <= 10 minutes,
            "Core: withdrawal request expired"
        );

        address lpAddress = getLp(request.tokenAddress);
        uint256 lpAmount = request.lpAmount - request.feeLpAmount;
        uint256 tokenAmount = IXlpt(lpAddress).lp2TokenAmount(lpAmount);

        IXlpt(lpAddress).burn(msg.sender, lpAmount);
        TransferHelper.safeTransfer(
            request.tokenAddress,
            msg.sender,
            tokenAmount
        );
        emit TokenWithdrawExecuted(request.withdrawId, tokenAmount);
        // reset the request
        delete address2WithdrawRequest[msg.sender];
    }

    function materializeTable(
        uint256 poolSize,
        uint256 outputAmount,
        ProbabilityTable calldata table
    ) internal pure returns (ProbabilityTable memory mt) {
        // check formats
        require(table.relatives.length >= 1, "Core: must have >= 1 branch");
        require(table.relatives.length <= 10, "Core: must have <= 10 branches");
        require(
            table.relatives.length == table.mExpectations.length &&
                table.relatives.length == table.mRewards.length,
            "Core: lists must have equal lengths"
        );
        mt = table;

        // check probabilities
        uint256 mExpectationSum = 0;
        uint256 mProbSum = 0;
        for (uint256 i = 0; i < mt.relatives.length; ++i) {
            require(mt.mExpectations[i] > 0, "Core: expectation must > 0");
            require(mt.mRewards[i] > 0, "Core: reward must > 0");
            mExpectationSum += mt.mExpectations[i];

            if (mt.relatives[i] == 0) {
                mt.mRewards[i] = (mt.mRewards[i] * poolSize) / M;
                mt.relatives[i] = 10;
            } else if (mt.relatives[i] == 1) {
                mt.mRewards[i] = (mt.mRewards[i] * outputAmount) / M;
                mt.relatives[i] = 10;
            } else {
                revert("Core: relative must be 0 or 1");
            }
            require(
                mt.mRewards[i] * 10 <= poolSize,
                "Core: reward must <= 10% of pool"
            );
            mt.mExpectations[i] = (mt.mExpectations[i] * outputAmount) / M;
            mProbSum += (M * mt.mExpectations[i]) / mt.mRewards[i];
        }

        require(
            mExpectationSum <= 7e5,
            "Core: expectation sum must <= 7e5 (70%)"
        );
        require(mProbSum <= M, "Core: probability sum must <= 1e6 (100%)");
    }

    function shareToken(
        address player,
        address inputToken,
        uint256 totalAmount
    )
        internal
        returns (
            uint256 tenPerAmount,
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
        tenPerAmount = (totalAmount * TEN_PERCENT_SHARE) / TOTAL_SHARE;
        TransferHelper.safeTransfer(inputToken, maintainer(), tenPerAmount);

        // transfer 10% inputToken to donation
        TransferHelper.safeTransfer(inputToken, donation, tenPerAmount);

        // 80% remaining
        remainingAmount = totalAmount - tenPerAmount * 2;
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
        require(inputAmount > 0, "Core: inputAmount is zero");
        require(
            inputAmount >= getLowerBound(inputToken),
            "Core: inputAmount is below lower bound"
        );
        require(repeats > 0, "Core: repeats is zero");
        uint256 originalPoolSize = myBalance(outputToken);

        TransferHelper.safeTransferFrom(
            inputToken,
            msg.sender,
            address(this),
            inputAmount * repeats
        );

        playTimesByToken[inputToken] += repeats;
        playAmountsByToken[inputToken] += inputAmount * repeats;

        // 1. share input token and give xexp
        (
            uint256 maintainerDonationAmount,
            uint256 remainingAmount,
            uint256 outputXexpAmount
        ) = shareToken(player, inputToken, inputAmount * repeats);

        // 2. swap and fund
        uint256 outputAmount = (swapAndFund(
            inputToken,
            remainingAmount,
            outputToken
        ) * TOTAL_SHARE) / ((POOL_SHARE + PLAYER_SHARE) * repeats);

        // 3. request randomness
        uint256 requestId = requestRandomness();
        requestId2PlayId[requestId] = playId;
        address2PlayIds[player].push(playId);

        // 4. validate table and materialize it; then push everything to storage
        mtTables.push(materializeTable(originalPoolSize, outputAmount, table));
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
                outputTotalAmount: 0,
                outputXexpAmount: outputXexpAmount
            })
        );

        emit PlayRequested(
            playStatuses[playId],
            maintainerDonationAmount,
            maintainerDonationAmount
        );

        // 5. post play
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
        require(playId < mtTables.length, "Core: table not found");
        return mtTables[playId];
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

        status.randomWord = randomness;
        status.fulfilled = true;
        uint256 rewardTotalAmount = 0;
        uint256 poolAmount = myBalance(status.outputToken);

        uint256 level = 0;
        uint256 reward = 0;
        for (uint256 i = 0; i < status.repeats; ++i) {
            (level, reward, randomness) = rewardCalculate(
                randomness,
                status.playId
            );
            rewardTotalAmount += Math.min(reward, poolAmount / 10);
            status.outcomeLevels.push(level);
        }

        status.outputTotalAmount = rewardTotalAmount;

        TransferHelper.safeTransfer(
            status.outputToken,
            status.player,
            status.outputTotalAmount
        );

        emit PlayFulfilled(status);
    }

    function rewardCalculate(
        uint256 randomness,
        uint256 playId
    )
        internal
        view
        returns (uint256 level, uint256 reward, uint256 newRandomness)
    {
        ProbabilityTable storage table = mtTables[playId];
        uint256 p = randomness % RAND_MAX;
        uint256 upper = 0;
        newRandomness = uint256(
            keccak256(abi.encodePacked(randomness, block.number))
        );

        for (uint256 i = 0; i < table.relatives.length; ++i) {
            upper += (RAND_MAX / table.mRewards[i]) * table.mExpectations[i];
            if (p < upper) {
                return (i, table.mRewards[i], newRandomness);
            }
        }

        return (table.relatives.length, 0, newRandomness);
    }

    function myBalance(address tokenAddress) internal view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
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
