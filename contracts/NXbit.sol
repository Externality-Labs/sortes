// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./IXbit.sol";
import "./IWETH.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/shared/token/ERC677/LinkToken.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@uniswap/swap-router-contracts/contracts/interfaces/ISwapRouter02.sol";
import "@uniswap/swap-router-contracts/contracts/interfaces/IV3SwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

abstract contract NXbit is IXbit, ERC20, ERC20Burnable, ConfirmedOwner {
    ERC20 _jkpt;
    IWETH _weth;
    ERC20 _usdt;
    ERC20 _usdc;
    ERC20 _xexp;
    LinkToken _link;
    address internal MAINTAINER_ADDRESS = address(0x0);

    uint256 internal constant WITHDRAW_FEE_MILLIONTH_RATIO = 1000; // 0.1%
    uint256 internal constant RAND_MAX = 2 ** 128;
    uint256 internal constant USD_DECIMALS = 6;
    uint256 internal constant USD_UNIT = 10 ** USD_DECIMALS;

    uint256[] internal requestIds;
    mapping(address => uint256[]) internal address2RequestIds;
    mapping(uint256 => RequestStatus) internal requestId2RequestStatus;

    uint256[] internal swapIds;
    uint256 internal nextSwapId = 1;
    mapping(address => uint256[]) internal address2SwapIds;
    mapping(uint256 => Swap) internal swapId2SwapDetail;

    uint256 internal claimableUsdtFee = 0;
    mapping(address => uint256) internal address2RemainingUsdtFees;
    mapping(address => uint256) internal address2TotalUsdtFees;
    uint256 internal claimableUsdcFee = 0;
    mapping(address => uint256) internal address2RemainingUsdcFees;
    mapping(address => uint256) internal address2TotalUsdcFees;

    // Chainlink variables
    AggregatorV3Interface internal immutable aggregator;

    // Uniswap variables
    ISwapRouter02 internal immutable swapRouter02;
    uint24 internal constant poolFee100mu = 100;
    uint24 internal constant poolFee500mu = 500;
    uint24 internal constant poolFee3000mu = 3000;

    // === Basic functions ===
    constructor(
        TokenAddress memory addresses,
        address _addr_uniswap_swaprouter02,
        address _addr_chainlink_aggregator
    ) ERC20("Xbit", "XBIT") {
        _jkpt = ERC20(addresses.jkpt);
        _weth = IWETH(addresses.weth);
        _usdt = ERC20(addresses.usdt);
        _usdc = ERC20(addresses.usdc);
        _xexp = ERC20(addresses.xexp);
        _link = LinkToken(addresses.link);

        swapRouter02 = ISwapRouter02(_addr_uniswap_swaprouter02);
        aggregator = AggregatorV3Interface(_addr_chainlink_aggregator);
    }

    function setMaintainer(address new_maintainer) public onlyOwner {
        MAINTAINER_ADDRESS = new_maintainer;
    }

    /**
     * @dev See {ERC20-_mint}.
     */
    function _mint(address account, uint256 amount) internal virtual override {
        super._mint(account, amount);
    }

    // for testing purpose only
    // function mint(address to, uint256 amount) public onlyOwner {
    //     _mint(to, amount);
    // }

    function getAddressJKPT() external view override returns (address) {
        return address(_jkpt);
    }

    function save(uint256 amount_jkpt) external override {
        if (amount_jkpt == 0) return;
        uint256 total_jkpt = this.getPrizePoolSizeInJKPT();
        uint256 total_xbit = this.totalSupply();
        uint256 zeros_jkpt = 10 ** _jkpt.decimals();
        uint256 zeros_xbit = 10 ** this.decimals();

        uint256 amount_xbit = 0;
        if (total_xbit == 0 || total_jkpt == 0) {
            // initialize jkpt-xbit pool
            amount_xbit = (amount_jkpt * zeros_xbit) / zeros_jkpt;
        } else {
            amount_xbit = (amount_jkpt * total_xbit) / total_jkpt;
        }

        _jkpt.transferFrom(msg.sender, address(this), amount_jkpt);
        _mint(msg.sender, amount_xbit);

        emit SaveJKPT(amount_jkpt, amount_xbit, msg.sender);
    }

    function withdraw(uint256 amount_xbit) external override {
        uint256 total_jkpt = this.getPrizePoolSizeInJKPT();
        uint256 total_xbit = this.totalSupply();
        if (amount_xbit == 0 || total_xbit == 0) return;

        uint256 amount_jkpt = (amount_xbit * total_jkpt) / total_xbit;
        uint256 fee_jkpt = (amount_jkpt * WITHDRAW_FEE_MILLIONTH_RATIO) / 1e6;
        amount_jkpt -= fee_jkpt;

        burn(amount_xbit);
        _jkpt.transfer(msg.sender, amount_jkpt);
        _jkpt.transfer(MAINTAINER_ADDRESS, fee_jkpt);

        emit WithdrawJKPT(amount_xbit, amount_jkpt, msg.sender);
    }

    function claimRemainingRewardFee() external override {
        uint256 remainingUsdtFee = address2RemainingUsdtFees[msg.sender];
        uint256 remainingUsdcFee = address2RemainingUsdcFees[msg.sender];
        require(
            remainingUsdtFee + remainingUsdcFee > 0,
            "no remaining reward fees"
        );

        address2RemainingUsdtFees[msg.sender] = 0;
        address2RemainingUsdcFees[msg.sender] = 0;
        address2TotalUsdtFees[msg.sender] += remainingUsdtFee;
        address2TotalUsdcFees[msg.sender] += remainingUsdcFee;
        claimableUsdtFee -= remainingUsdtFee;
        claimableUsdcFee -= remainingUsdcFee;
        TransferHelper.safeTransfer(
            address(_usdt),
            msg.sender,
            remainingUsdtFee
        );
        TransferHelper.safeTransfer(
            address(_usdc),
            msg.sender,
            remainingUsdcFee
        );

        emit RewardFeeClaimed(msg.sender, remainingUsdtFee, remainingUsdcFee);
    }

    function getRemainingRewardFee()
        external
        view
        override
        returns (uint256 usdtFee, uint256 usdcFee)
    {
        usdtFee = address2RemainingUsdtFees[msg.sender];
        usdcFee = address2RemainingUsdcFees[msg.sender];
    }

    function getTotalRewardFee()
        external
        view
        override
        returns (uint256 usdtFee, uint256 usdcFee)
    {
        usdtFee = address2TotalUsdtFees[msg.sender];
        usdcFee = address2TotalUsdcFees[msg.sender];
    }

    // === Swap functions ===
    function registerSwap(
        Swap memory swap
    ) external override returns (uint256) {
        require(
            address2SwapIds[swap.owner].length < 100,
            "too many swaps registered by the swap owner"
        );

        swap.id = nextSwapId;
        nextSwapId += 1;

        verifySwap(swap);
        swapIds.push(swap.id);
        address2SwapIds[swap.owner].push(swap.id);
        swapId2SwapDetail[swap.id] = swap;

        emit SwapRegistered(swap.id, swap.owner);
        return swap.id;
    }

    function verifySwap(Swap memory swap) private view {
        require(swap.relatives.length > 0, "must have at least one branch");
        require(swap.relatives.length <= 10, "too many branches (> 10)");
        require(
            swap.relatives.length == swap.expectations.length &&
                swap.relatives.length == swap.rewards.length,
            "relatives, expectations, rewards must have equal lengths"
        );
        require(
            swap.millionth_ratio <= 8e4,
            "millionth ratio must <= 8e4 (8%)"
        );

        // calculate pool size
        uint256 jkpt_ticket = estimateUSD2JKPT(10 * USD_UNIT);

        uint256 jkpt_amount_pool = this.getPrizePoolSizeInJKPT();
        uint256 usdt_amount_pool = (jkpt_amount_pool * 10 * USD_UNIT) /
            jkpt_ticket;

        uint256 expection_sum = 0;
        uint256 prob_sum = 0;
        uint256 reward_usdt = 0;
        for (uint256 i = 0; i < swap.relatives.length; ++i) {
            expection_sum += swap.expectations[i];
            require(expection_sum <= 8 * USD_UNIT, "expectation too large");
            if (swap.relatives[i]) {
                require(
                    swap.rewards[i] <= 1e5,
                    "relative reward must be less than 1e5 (10% of pool)"
                );
                require(
                    swap.rewards[i] > 0,
                    "relative reward must be more than 0"
                );
            } else {
                require(
                    swap.rewards[i] <= usdt_amount_pool / 10,
                    "absolute reward must be less than 10% of pool"
                );
                require(
                    swap.rewards[i] >= USD_UNIT / 100,
                    "absolute reward must be more than 0.01 USDT"
                );
            }
            reward_usdt = swap.relatives[i]
                ? (swap.rewards[i] * usdt_amount_pool) / 1e6
                : swap.rewards[i];
            prob_sum += (swap.expectations[i] * 1e6) / reward_usdt;
        }

        require(prob_sum <= 1e6, "probability sum too large");
    }

    function getSwap(
        uint256 swapId
    ) external view override returns (Swap memory) {
        return swapId2SwapDetail[swapId];
    }

    function listSwapIds(
        address owner
    ) external view override returns (uint256[] memory) {
        return address2SwapIds[owner];
    }

    function listSwaps(
        address owner
    ) external view override returns (Swap[] memory) {
        uint256[] memory ownerSwapIds = address2SwapIds[owner];
        Swap[] memory swaps = new Swap[](ownerSwapIds.length);
        for (uint256 i = 0; i < ownerSwapIds.length; ++i) {
            swaps[i] = swapId2SwapDetail[ownerSwapIds[i]];
        }
        return swaps;
    }

    function playSwap(
        uint256 amount,
        uint8 usdType,
        uint256 swapId
    ) external override returns (uint256 requestId) {
        require(amount >= 10 * USD_UNIT, "amount must be at least 10 USD");
        require(
            usdType == 0 || usdType == 1,
            "usdType must be 0 (USDT) or 1 (USDC)"
        );

        // sent USD to the contract pool

        // r to claimer, 10% - r to donation, rest to pool
        Swap storage swap = swapId2SwapDetail[swapId];
        require(
            swap.millionth_ratio <= 8e4,
            "millionth ratio must <= 8e4 (8%)"
        );
        uint256 amount_claimer = (amount * swap.millionth_ratio) / 1e6;
        uint256 amount_donation = amount / 10 - amount_claimer;
        uint256 amount_topool = amount - amount_claimer - amount_donation;

        // transfer to donation
        TransferHelper.safeTransferFrom(
            usdType == 0 ? address(_usdt) : address(_usdc),
            msg.sender,
            MAINTAINER_ADDRESS,
            amount_donation
        );

        // transfer claimer and pool
        TransferHelper.safeTransferFrom(
            usdType == 0 ? address(_usdt) : address(_usdc),
            msg.sender,
            address(this),
            amount_claimer + amount_topool
        );

        // increase claimable fee
        if (usdType == 0) {
            claimableUsdtFee += amount_claimer;
            address2RemainingUsdtFees[swap.owner] += amount_claimer;
        } else {
            claimableUsdcFee += amount_claimer;
            address2RemainingUsdcFees[swap.owner] += amount_claimer;
        }

        amount_topool = amount_topool - fundSubscription(9 * USD_UNIT, usdType);
        if (amount_topool > 0) {
            convertUSD2JKPT(amount_topool, usdType);
        }

        requestId = preRandom(
            amount,
            amount_claimer,
            amount_donation,
            usdType,
            swapId
        );
        simpleFulfillRandomness(requestId); // should do nothing if VRF is used
    }

    // === Reward functions ===

    function rewardByRandom(
        uint256 jkpt_ticket,
        uint256 random_word,
        uint256 swapId
    )
        private
        view
        returns (uint256 reward_level, uint256 reward_xexp, uint256 reward_jkpt)
    {
        uint256 p = random_word % RAND_MAX;
        uint256 usdt_amount_pool = (this.getPrizePoolSizeInJKPT() *
            10 *
            USD_UNIT) / jkpt_ticket;

        Swap storage swap = swapId2SwapDetail[swapId];
        uint256 upper = 0;
        uint256 xexp_amount = 100 * 10 ** _xexp.decimals();

        for (uint256 i = 0; i < swap.relatives.length; ++i) {
            uint256 reward_usdt = swap.relatives[i]
                ? (swap.rewards[i] * usdt_amount_pool) / 1e6
                : swap.rewards[i];

            upper += (RAND_MAX / reward_usdt) * swap.expectations[i];

            if (p < upper) {
                reward_level = i;
                reward_usdt = Math.min(reward_usdt, usdt_amount_pool / 10);
                reward_jkpt = (reward_usdt * jkpt_ticket) / 10 / USD_UNIT;
                reward_xexp = xexp_amount;

                return (reward_level, reward_xexp, reward_jkpt);
            }
        }

        return (swap.relatives.length, xexp_amount * 2, 0);
    }

    function simpleFulfillRandomness(uint256 requestId) internal virtual {}

    function preRandom(
        uint256 amount_usd,
        uint256 swap_fee,
        uint256 donation_fee,
        uint8 usd_type,
        uint256 swapId
    ) internal returns (uint256 requestId) {
        uint256 quantity = amount_usd / USD_UNIT / 10;

        requestId = requestRandomWords();
        requestIds.push(requestId);

        address2RequestIds[msg.sender].push(requestId);
        requestId2RequestStatus[requestId] = RequestStatus({
            exists: true,
            requestId: requestId,
            player: msg.sender,
            swapId: swapId,
            usdIn: amount_usd,
            usdType: usd_type, // 0 for USDT, 1 for USDC
            jkptTicket: estimateUSD2JKPT(10 * USD_UNIT),
            quantity: quantity,
            // will be fulfilled after revealing
            fulfilled: false, // TBD
            randomWord: 0, // TBD
            rewardLevels: new uint256[](0), // TBD
            xexpOut: 0, // TBD
            jkptOut: 0, // TBD
            swapFee: swap_fee,
            donation: donation_fee
        });

        emit RequestedRandomness(requestId, msg.sender);
    }

    function afterRandom(uint256 requestId, uint256 randomWord) internal {
        RequestStatus storage status = requestId2RequestStatus[requestId];
        require(status.exists, "invalid request");
        require(!status.fulfilled, "already fulfilled");

        uint256 amount_xexp = 0;
        uint256 amount_jkpt = 0;
        status.randomWord = randomWord;

        for (uint i = 0; i < status.quantity; i++) {
            uint256 reward_level = 0;
            uint256 reward_xexp = 0;
            uint256 reward_jkpt = 0;
            (reward_level, reward_xexp, reward_jkpt) = rewardByRandom(
                status.jkptTicket,
                randomWord,
                status.swapId
            );
            amount_xexp += reward_xexp;
            amount_jkpt += reward_jkpt;
            status.rewardLevels.push(reward_level);
            randomWord = uint256(
                keccak256(abi.encodePacked(randomWord, status.player))
            );
        }

        status.xexpOut = amount_xexp;
        status.jkptOut = amount_jkpt;
        status.fulfilled = true;

        reward(amount_xexp, amount_jkpt, status.player);

        emit LotteryOutcome(requestId, status);
    }

    function reward(
        uint256 amount_xexp,
        uint256 amount_jkpt,
        address receiver
    ) internal {
        if (amount_xexp > 0) {
            _xexp.transfer(receiver, amount_xexp);
        }

        if (amount_jkpt > 0) {
            _jkpt.transfer(receiver, amount_jkpt);
        }
    }

    function getRequestIdsByAddress(
        address player
    ) external view override returns (uint256[] memory) {
        return address2RequestIds[player];
    }

    function getRequestStatusById(
        uint256 requestId
    ) external view override returns (RequestStatus memory) {
        return requestId2RequestStatus[requestId];
    }

    function convertUSD2JKPT(
        uint amountIn,
        uint8 usdType
    ) internal returns (uint amountOut) {
        if (usdType == 0) {
            return convertUSDT2JKPT(amountIn);
        } else {
            return convertUSDC2JKPT(amountIn);
        }
    }

    function convertUSDT2JKPT(
        uint amountIn
    ) internal virtual returns (uint amountOut) {
        // Approve the router to spend usdt.
        TransferHelper.safeApprove(
            address(_usdt),
            address(swapRouter02),
            amountIn
        );

        IV3SwapRouter.ExactInputParams memory params = IV3SwapRouter
            .ExactInputParams({
                path: abi.encodePacked(
                    address(_usdt),
                    poolFee500mu,
                    address(_weth),
                    poolFee500mu,
                    address(_jkpt)
                ),
                recipient: address(this),
                amountIn: amountIn,
                amountOutMinimum: (estimateUSD2JKPT(amountIn) * 3) / 4 // amountMin
            });

        // Executes the swap.
        amountOut = swapRouter02.exactInput(params);
    }

    function convertUSDC2JKPT(
        uint amountIn
    ) internal virtual returns (uint amountOut) {
        // Approve the router to spend usdc.
        TransferHelper.safeApprove(
            address(_usdc),
            address(swapRouter02),
            amountIn
        );

        IV3SwapRouter.ExactInputParams memory params = IV3SwapRouter
            .ExactInputParams({
                path: abi.encodePacked(
                    address(_usdc),
                    poolFee500mu,
                    address(_jkpt)
                ),
                recipient: address(this),
                amountIn: amountIn,
                amountOutMinimum: (estimateUSD2JKPT(amountIn) * 3) / 4 // amountMin
            });

        // Executes the swap.
        amountOut = swapRouter02.exactInput(params);
    }

    function convertUSD2LINK(
        uint amountIn,
        uint8 usdType
    ) internal returns (uint amountOut) {
        address address_usd = usdType == 0 ? address(_usdt) : address(_usdc);
        // Approve the router to spend.
        TransferHelper.safeApprove(
            address_usd,
            address(swapRouter02),
            amountIn
        );

        IV3SwapRouter.ExactInputParams memory params = IV3SwapRouter
            .ExactInputParams({
                path: abi.encodePacked(
                    address_usd,
                    poolFee500mu,
                    address(_weth),
                    poolFee3000mu,
                    address(_link)
                ),
                recipient: address(this),
                amountIn: amountIn,
                amountOutMinimum: 0
            });

        // Executes the swap.
        amountOut = swapRouter02.exactInput(params);
    }

    function convertUSD2WETH(
        uint amountIn,
        uint8 usdType
    ) internal returns (uint amountOut) {
        address address_usd = usdType == 0 ? address(_usdt) : address(_usdc);
        // Approve the router to spend.
        TransferHelper.safeApprove(
            address_usd,
            address(swapRouter02),
            amountIn
        );

        IV3SwapRouter.ExactInputParams memory params = IV3SwapRouter
            .ExactInputParams({
                path: abi.encodePacked(
                    address_usd,
                    poolFee500mu,
                    address(_weth)
                ),
                recipient: address(this),
                amountIn: amountIn,
                amountOutMinimum: 0
            });

        // Executes the swap.
        amountOut = swapRouter02.exactInput(params);
    }

    function estimateUSD2JKPT(
        uint amountIn
    ) public view virtual returns (uint) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int256 answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = aggregator.latestRoundData();
        return
            (amountIn *
                10 **
                    (aggregator.decimals() + _jkpt.decimals() - USD_DECIMALS)) /
            uint256(answer);
    }

    function getPrizePoolSizeInJKPT() external view override returns (uint256) {
        return _jkpt.balanceOf(address(this));
    }

    function getPrizePoolSizeInUSD() external view override returns (uint256) {
        uint256 jkpt_ticket = estimateUSD2JKPT(10 * USD_UNIT);
        uint256 jkpt_amount_pool = this.getPrizePoolSizeInJKPT();
        uint256 usdt_amount_pool = (jkpt_amount_pool * 10 * USD_UNIT) /
            jkpt_ticket;
        return usdt_amount_pool;
    }

    // virtual functions
    function fundSubscription(
        uint256 usd_amount,
        uint8 usdType
    ) internal virtual returns (uint256);

    function requestRandomWords() internal virtual returns (uint256);

    // function fulfillRandomWords();

    receive() external payable {}
}
