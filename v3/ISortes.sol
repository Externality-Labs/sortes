// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @dev Interface of the Sortes contract.
 */
interface ISortes {
    // === important structs ===

    /**
     * @dev Describe the parameters of the sortes contract.
     */
    struct Parameters {
        address xexp;
        address good;
        address usd;
        uint256 halfLife;
        uint256 gRegisterReceiver;
        uint256 gVerifyReceiver;
        uint256 gInitiateDonation;
        uint256 gCostPerDay;
        uint256 eVoteMin;
        uint256 mUsdXexpRate;
        uint256 tGlobalClaimLockDeadline;
    }

    /**
     * @dev Describe a receiver.
     */
    struct Receiver {
        uint256 id;
        address receiver;
        address creator;
    }

    /**
     * @dev Describe a donation.
     */
    struct Donation {
        uint256 id;
        address receiver;
        address initiator;
        uint256 currentAmount;
        uint256 startTime;
        uint256 expireTime;
        bool isValid;
        bool isExecuted;
    }

    /**
     * @dev Setup the parameters of the sortes contract. Maintainer only.
     * @param p The parameters of the sortes contract.
     */
    function setupParams(Parameters memory p) external; // onlyMaintainer

    /**
     * @dev Get the parameters of the sortes contract. Maintainer only.
     * @return p The parameters of the sortes contract.
     */
    function getParams() external view returns (Parameters memory p); // onlyMaintainer

    // === receiver related ===

    /**
     * @dev Register a receiver with GOOD burned.
     * @param receiver address of the receiver.
     * @return receiverId id of the receiver.
     * @notice EMIT ReceiverRegistered event.
     */
    function registerReceiver(
        address receiver
    ) external returns (uint256 receiverId);

    event ReceiverRegistered(Receiver receiver);

    /**
     * @dev Get the total quantity of receivers.
     * @return total quantity of receivers.
     */
    function getReceiversTotal() external view returns (uint256);

    /**
     * @dev List the receivers created by the user.
     * @param user address of the user.
     * @return receivers records of the receivers.
     */
    function listReceivers(
        address user
    ) external view returns (Receiver[] memory receivers);

    /**
     * @dev Get the receivers by ids.
     * @param ids list of receiver ids.
     * @return receivers list of receivers.
     */
    function getReceivers(
        uint256[] calldata ids
    ) external view returns (Receiver[] memory receivers);

    /**
     * @dev Request a receiver verification with GOOD spent.
     * @param id id of the receiver.
     * @notice EMIT ReceiverVerificationRequested event.
     */
    function requestReceiverVerification(uint256 id) external;

    event ReceiverVerificationRequested(Receiver receiver);

    // === donation related ===

    /**
     * @dev Initiate a donation with GOOD spent.
     * @param receiver address of the receiver.
     * @return donationId id of the donation.
     * @notice EMIT DonationInitiated event.
     */
    function initiateDonation(
        address receiver
    ) external returns (uint256 donationId);

    event DonationInitiated(Donation donation);

    /**
     * @dev Extend a donation with GOOD spent.
     * @param donationId id of the donation.
     * @param goodAmount amount of GOOD to extend.
     * @notice EMIT DonationExtended event.
     */
    function extendDonation(uint256 donationId, uint256 goodAmount) external;

    event DonationExtended(Donation donation);

    /**
     * @dev Get the total quantity of donations.
     * @return total quantity of donations.
     */
    function getDonationsTotal() external view returns (uint256);

    /**
     * @dev List the donations initiated by the user.
     * @param user address of the user.
     * @return donations list of donations belonging to the receiver.
     */
    function listDonations(
        address user
    ) external view returns (Donation[] memory donations);

    /**
     * @dev Get the donations by ids.
     * @param ids list of donation ids.
     * @return donations list of donations.
     */
    function getDonations(
        uint256[] calldata ids
    ) external view returns (Donation[] memory donations);

    /**
     * @dev Vote a donation with XEXP converted to GOOD.
     * @param donationId id of the donation.
     * @param xexpAmount amount of XEXP to vote.
     * @return usdAmount amount of USD added to the donation.
     * @return goodAmount amount of GOOD converted from XEXP.
     * @notice EMIT DonationVoted event.
     */
    function voteDonation(
        uint256 donationId,
        uint256 xexpAmount
    ) external returns (uint256 usdAmount, uint256 goodAmount);

    event DonationVoted(
        address indexed user,
        uint256 donationId,
        uint256 xexpAmount, // XEXP amount used to vote
        uint256 usdAmount, // USD added to donate
        uint256 goodAmount // GOOD converted from XEXP
    );

    /**
     * @dev Close and execute a donation. Sender must be the initiator.
     * @param donationId id of the donation.
     * @notice EMIT DonationClosed event.
     */
    function closeDonation(uint256 donationId) external;

    event DonationClosed(Donation donation);

    // === good related ===

    /**
     * @dev Get the amount of GOOD converted from XEXP with current rate.
     * @param xexpAmount Input amount of XEXP.
     * @return goodAmount Output amount of GOOD.
     */
    function amm(uint256 xexpAmount) external view returns (uint256 goodAmount);

    /**
     * @dev Convert XEXP to GOOD with current rate, without voting.
     * @param xexpAmount Input amount of XEXP.
     * @return goodAmount Output amount of GOOD.
     */
    function convertXexpToGood(
        uint256 xexpAmount
    ) external returns (uint256 goodAmount);

    event GoodConverted(
        address indexed user,
        uint256 xexpAmount,
        uint256 goodAmount
    );

    /**
     * @dev Get the unclaimed and claimable GOOD of a user.
     * @param user address of the user.
     * @return unclaimedGood amount of unclaimed GOOD.
     * @return claimableGood amount of claimable GOOD.
     */
    function getUnclaimedGood(
        address user
    ) external view returns (uint256 unclaimedGood, uint256 claimableGood);

    /**
     * @dev Claim all of the claimable GOOD of the caller.
     * @notice EMIT GoodClaimed event
     */
    function claimGood() external;

    event GoodClaimed(
        address indexed user,
        uint256 timestamp,
        uint256 claimedGoodAmount
    );

    /**
     * @dev Get the total balances of the contract.
     * @return xexpSpent amount of XEXP spent.
     * @return goodRedeemed amount of GOOD redeemed.
     * @return goodClaimed amount of GOOD claimed.
     */
    function getTotalBalances()
        external
        view
        returns (uint256 xexpSpent, uint256 goodRedeemed, uint256 goodClaimed);

    /**
     * @dev Get the balances of a user.
     * @param user address of the user.
     * @return xexpSpent amount of XEXP spent.
     * @return goodRedeemed amount of GOOD redeemed.
     * @return goodClaimed amount of GOOD claimed.
     */
    function getUserBalances(
        address user
    )
        external
        view
        returns (uint256 xexpSpent, uint256 goodRedeemed, uint256 goodClaimed);

    /**
     * @dev Withdraw token from contract. Maintainer only.
     * @param token address of the token to withdraw.
     * @param amount amount of the token to withdraw.
     */
    function withdraw(address token, uint256 amount) external; // onlyMaintainer
}
