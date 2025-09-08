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
        address locker;
        uint256 xexpReserved;
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
        uint256 endTime;
        bool isActivated;
        bool isExecuted;
    }

    // === maintenance related ===

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

    /**
     * @dev Activate or inactivate a donation. Maintainer only.
     * @param donationId id of the donation.
     * @param value true to activate, false to inactivate.
     */
    function activate(uint256 donationId, bool value) external; // onlyMaintainer

    /**
     * @dev Withdraw token from contract. Maintainer only.
     * @param token address of the token to withdraw.
     * @param amount amount of the token to withdraw.
     */
    function withdraw(address token, uint256 amount) external; // onlyMaintainer

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
     * @param playId id of the play (for tracking purposes).
     * @param xexpAmount amount of XEXP to vote.
     * @return usdAmount amount of USD added to the donation.
     * @return goodAmount amount of GOOD converted from XEXP.
     * @notice EMIT DonationVoted event.
     */
    function voteDonation(
        uint256 donationId,
        uint256 playId,
        uint256 xexpAmount
    ) external returns (uint256 usdAmount, uint256 goodAmount);

    event DonationVoted(
        address indexed user,
        uint256 donationId,
        uint256 playId, // play id for tracking purposes
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
    function convertGoodAndLock(
        uint256 xexpAmount
    ) external returns (uint256 goodAmount);

    event GoodConverted(
        address indexed user,
        uint256 xexpAmount,
        uint256 goodAmount
    );
}
