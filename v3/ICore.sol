// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @dev Interface of the Xbit Core contract.
 */
interface ICore {
    // === important structs ===

    /**
     * @dev Describe the probability distribution table.
     */
    struct ProbabilityTable {
        // level == index
        uint8[] relatives; // reward is relative to: 0 = pool, 1 = input, 10 = absolute
        uint256[] mExpectations; // always relative to input; absolute expectation = input_amount * expectation / 1e6
        uint256[] mRewards; // absolute reward = reward * pool_size / 1e6 or reward * input_amount / 1e6
        uint256 tag; // a number tagging the table, used to identify the table
    }

    /**
     * @dev Describe the status of a play.
     */
    struct PlayStatus {
        bool fulfilled;
        uint256 playId; // start from 0
        uint256 blockNumber;
        uint256 blockTimestamp;
        address player;
        address inputToken;
        uint256 inputAmount;
        uint256 repeats;
        address outputToken;
        uint256 requestId;
        uint256 tableTag;
        // below to be fulfilled
        uint256 randomWord; // returned by VRF
        uint256[] outcomeLevels;
        uint256 outputTotalAmount;
        uint256 outputXexpAmount; // proportional to inputAmount * repeats
    }

    // === pool related ===

    /**
     * @dev Deposit token to the pool.
     * @param tokenAddress address of the token to deposit.
     * @param tokenAmount amount of the token to deposit.
     * @return lpAmount amount of the LP token minted.
     * EMIT TokenDeposited event.
     */
    function deposit(
        address tokenAddress,
        uint256 tokenAmount
    ) external returns (uint256 lpAmount);

    event TokenDeposited(
        address tokenAddress,
        uint256 tokenAmount,
        uint256 lpAmount,
        address user
    );

    /**
     * @dev Withdraw token from the pool.
     * @param tokenAddress address of the token to withdraw.
     * @param lpAmount amount of the LP token to withdraw.
     * EMIT TokenWithdrawn event.
     */
    function withdraw(
        address tokenAddress,
        uint256 lpAmount
    ) external returns (uint256 tokenAmount);

    event TokenWithdrawn(
        address tokenAddress,
        uint256 lpAmount,
        uint256 tokenAmount,
        address user
    );

    // === play related ===

    /**
     * @dev Play with token.
     * @param player account address of the player.
     * @param inputToken token address to play with.
     * @param inputAmount amount of input token to play once.
     * @param repeats times to play.
     * @param outputToken token address to receive.
     * @param table a valid probability table.
     * @return playId id of the play.
     * EMIT PlayRequested event.
     */
    function play(
        address player,
        address inputToken,
        uint256 inputAmount,
        uint256 repeats,
        address outputToken,
        ProbabilityTable calldata table
    ) external returns (uint256 playId);

    event PlayRequested(
        PlayStatus status,
        uint256 maintainerAmount,
        uint256 donationAmount
    );

    event PlayFulfilled(PlayStatus status);

    /**
     * @dev List the play ids of the player.
     * @param player address of the player.
     * @return playIds ids of the plays belonging to the player.
     */
    function listPlayIds(
        address player
    ) external view returns (uint256[] memory playIds);

    /**
     * @dev Get the play status by id.
     * @param playId id of the play.
     * @return status status of the play.
     */
    function getPlayStatusById(
        uint256 playId
    ) external view returns (PlayStatus memory status);

    /**
     * @dev Get the probability table by id.
     * @param playId id of the play.
     * @return table probability table of the play.
     */
    function getProbabilityTableById(
        uint256 playId
    ) external view returns (ProbabilityTable memory table);

    // === maintenance related ===
    /**
     *
     * @param _donation address of the donation account.
     */
    function setDonation(address _donation) external;

    /**
     * @dev Get play statistics of a token.
     * @return playTimes total number of plays with the token.
     * @return playAmounts total amount of the token played.
     */
    function getTokenStatistics(
        address token
    ) external view returns (uint256 playTimes, uint256 playAmounts);

    event DonationSet(address donation);

    event VrfFunded(uint256 amount);
}
