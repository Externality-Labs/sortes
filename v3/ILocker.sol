// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @dev Interface of the Locker contract.
 */
interface ILocker {
    // === important structs ===

    /**
     * @dev Describe the parameters of the locker contract.
     */
    struct Parameters {
        address token;
        uint256 halfLife;
        uint256 globalLockDeadline;
    }

    // === maintenance related ===

    /**
     * @dev Setup the parameters of the locker contract. Maintainer only.
     * @param p The parameters of the locker contract.
     */
    function setupParams(Parameters memory p) external; // onlyMaintainer

    /**
     * @dev Get the parameters of the locker contract. Maintainer only.
     * @return p The parameters of the locker contract.
     */
    function getParams() external view returns (Parameters memory p); // onlyMaintainer

    // === token related ===

    /**
     * @dev transfer token into the locker and lock for a user.
     * @param user address of the user.
     * @param tokenAmount amount of token to lock.
     * @notice EMIT TokenLocked event.
     */
    function lockToken(address user, uint256 tokenAmount) external;

    event TokenLocked(
        address indexed user,
        uint256 tokenAmount,
        uint256 timestamp
    );

    /**
     * @dev Query the locked and claimable token of a user.
     *      locked + claimable = unclaimed
     * @param user address of the user.
     * @return lockedAmount amount of locked token.
     * @return claimableAmount amount of claimable token.
     */
    function queryToken(
        address user
    ) external view returns (uint256 lockedAmount, uint256 claimableAmount);

    /**
     * @dev Claim all of the claimable token of the user.
     * @param user address of the user.
     * @notice EMIT TokenClaimed event
     */
    function claimToken(address user) external;

    event TokenClaimed(
        address indexed user,
        uint256 claimedAmount,
        uint256 timestamp
    );

    /**
     * @dev Get the total history of the contract.
     * @return receivedAmount amount of token received totally.
     * @return claimedAmount amount of token claimed totally.
     */
    function getTotalHistory()
        external
        view
        returns (uint256 receivedAmount, uint256 claimedAmount);

    /**
     * @dev Get the history of a user.
     * @param user address of the user.
     * @return receivedAmount amount of token received by the user.
     * @return claimedAmount amount of token claimed by the user.
     */
    function getUserHistory(
        address user
    ) external view returns (uint256 receivedAmount, uint256 claimedAmount);
}
