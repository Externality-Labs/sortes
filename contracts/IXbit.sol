// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @dev Interface of the Xbit contract series.
 */
interface IXbit is IERC20 {
    /**
     * @dev Describe the status of a swap request.
     */
    struct RequestStatus {
        bool exists; // whether a requestId exists
        // will be fulfilled after randomness generated
        bool fulfilled; // whether the request has been successfully fulfilled
        uint256 requestId; // id of the request
        address player; // address of the player
        uint256 swapId; // id of the swap instance
        uint256 usdIn; // total amount of USD player put in
        uint8 usdType; // 0 for USDT, 1 for USDC
        uint256 jkptTicket; // amount of JKPT equaling to one ticket
        uint256 quantity; // number of tickets
        uint256 randomWord; // random word generated
        uint256[] rewardLevels; // reward level of each ticket results
        uint256 xexpOut; // total amount of XEXP player will get
        uint256 jkptOut; // total amount of JKPT player will get
        uint256 swapFee; // total amount of USD swap owner will get
        uint256 donation; // total amount of USD of charitiable donation
    }

    /**
     * @dev Describe the probability distribution of a swap.
     */
    struct Swap {
        // level == index + 1
        bool[] relatives; // whether the reward is relative to pool size
        uint256[] expectations; // unit is USDT amount; probability = expectation / reward
        uint256[] rewards; // if relative, real reward = reward * pool_size / 1e6; otherwise unit is USDT amount
        uint256 millionth_ratio; // ratio (millionth_ratio / 1e6) of the reward shared to the swap owner
        address owner; // must be filled as a valid address string
        string name; // can be empty
        uint256 id; // auto filled
    }

    /**
     * @dev Describe the addresses of the tokens used in the contract.
     */
    struct TokenAddress {
        address jkpt;
        address weth;
        address usdt;
        address usdc;
        address link;
        address xexp;
    }

    /**
     * @dev Emitted when `amount_jkpt` JKPT token is saved and `amount_xbit` of XBIT is minted by `player`.
     */
    event SaveJKPT(uint256 amount_jkpt, uint256 amount_xbit, address player);

    /**
     * @dev Emitted when `amount_xbit` of XBIT is burned and `amount_jkpt` JKPT is received by `player`.
     */
    event WithdrawJKPT(
        uint256 amount_xbit,
        uint256 amount_jkpt,
        address player
    );

    event SwapRegistered(uint256 swapId, address owner);
    event RequestedRandomness(uint256 reqId, address invoker);
    event LotteryOutcome(uint256 reqId, RequestStatus status);
    event RewardFeeClaimed(
        address distributor,
        uint256 usdtFee,
        uint256 usdcFee
    );

    /**
     * @dev Returns the address of the JKPT token.
     */
    function getAddressJKPT() external view returns (address);

    /**
     * @dev Registers a valid `swap`. Returns the id of the swap if successful.
     */
    function registerSwap(Swap memory swap) external returns (uint256);

    /**
     * @dev Returns the swap with the given `swapId`.
     */
    function getSwap(uint256 swapId) external view returns (Swap memory);

    /**
     * @dev Returns the swap id list of the owner.
     */
    function listSwapIds(
        address owner
    ) external view returns (uint256[] memory);

    /**
     * @dev Returns the swap list of the owner.
     */
    function listSwaps(address owner) external view returns (Swap[] memory);

    /**
     * @dev Plays a swap with randomness requested from a generator.
     * `amount`: amount of USDT or USDC player put in
     * `usdType`: 0 for USDT, 1 for USDC
     * `swapId`: id of the pre-registered swap
     */
    function playSwap(
        uint256 amount,
        uint8 usdType,
        uint256 swapId
    ) external returns (uint256 requestId);

    /**
     * @dev Claims the remaining reward fee of the caller.
     */
    function claimRemainingRewardFee() external;

    /**
     * @dev Returns the remaining reward fee to claim by the caller.
     */
    function getRemainingRewardFee()
        external
        view
        returns (uint256 usdtFee, uint256 usdcFee);

    /**
     * @dev Returns the total reward fee claimed by the caller.
     */
    function getTotalRewardFee()
        external
        view
        returns (uint256 usdtFee, uint256 usdcFee);

    /**
     * @dev Saves `amount_jkpt` JKPT and mints XBIT to the caller.
     */
    function save(uint256 amount_jkpt) external;

    /**
     * @dev Burns `amount_xbit` XBIT and withdraws JKPT to the caller.
     */
    function withdraw(uint256 amount_xbit) external;

    /**
     * @dev Returns the request id list of the player.
     */
    function getRequestIdsByAddress(
        address player
    ) external view returns (uint256[] memory);

    /**
     * @dev Returns the request status of the request with the given `requestId`.
     */
    function getRequestStatusById(
        uint256 requestId
    ) external view returns (RequestStatus memory);

    /**
     * @dev Gets the current prize pool size in JKPT.
     */
    function getPrizePoolSizeInJKPT() external view returns (uint256);

    /**
     * @dev Gets the current prize pool size in USD.
     */
    function getPrizePoolSizeInUSD() external view returns (uint256);
}
