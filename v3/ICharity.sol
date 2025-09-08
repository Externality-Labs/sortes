// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./ICore.sol";

/**
 * @dev Interface of the Charity contract.
 */
interface ICharity {
    // === important structs ===

    /**
     * @dev Describe the parameters of the charity contract.
     */
    struct Parameters {
        address xbit;
        address voucher;
        address sortes;
    }

    /**
     * @dev Setup the parameters of the charity contract. Maintainer only.
     * @param p The parameters of the charity contract.
     */
    function setupParams(Parameters memory p) external; // onlyMaintainer

    /**
     * @dev Get the parameters of the charity contract. Maintainer only.
     * @return p The parameters of the charity contract.
     */
    function getParams() external view returns (Parameters memory p); // onlyMaintainer

    event PlayResult(
        uint256 playId,
        uint256 donationId,
        uint256 usdDonatedAmount,
        uint256 goodReceivedAmount
    );

    /**
     * @dev Play with token then vote for the donation.
     * @param inputToken address of the input token.
     * @param inputAmount amount of the input token for each play.
     * @param repeats times of play.
     * @param outputToken address of the output token.
     * @param table a valid probability table.
     * @param donationId donation id to vote for.
     * @notice EMIT PlayResult event
     */
    function playWithToken(
        address inputToken,
        uint256 inputAmount,
        uint256 repeats,
        address outputToken,
        ICore.ProbabilityTable calldata table,
        uint256 donationId
    ) external returns (uint256 playId);

    /**
     * @dev Play with voucher then vote for the donation.
     * @param voucherId id of the voucher.
     * @param outputToken address of the output token.
     * @param table a valid probability table.
     * @param donationId donation id to vote for.
     * @notice EMIT PlayResult event
     */
    function playWithVoucher(
        uint256 voucherId,
        address outputToken,
        ICore.ProbabilityTable calldata table,
        uint256 donationId
    ) external returns (uint256 playId);
}
