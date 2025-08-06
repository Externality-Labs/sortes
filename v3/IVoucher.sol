// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./ICore.sol";

/**
 * @dev Interface of the Xbit Voucher contract.
 */
interface IVoucher {
    /**
     * @dev Describe the voucher detail.
     */
    struct VoucherDetail {
        uint256 id; // a hash value
        address inputToken;
        uint256 inputAmount;
        uint256 repeats;
    }

    /**
     * @dev Issue vouchers.
     * @param inputToken address of the input token.
     * @param inputAmount amount of the input token for each play.
     * @param repeats times of play.
     * @param quantity number of vouchers to be issued.
     * @return voucherId id of the voucher.
     * EMIT VoucherIssued event.
     */
    function issue(
        address inputToken,
        uint256 inputAmount,
        uint256 repeats,
        uint256 quantity
    ) external returns (uint256 voucherId);

    event VoucherIssued(
        uint256 voucherId,
        address inputToken,
        uint256 inputAmount,
        uint256 repeats,
        uint256 quantity
    );

    /**
     * @dev Get the voucher detail from voucher id.
     * @param voucherId id of the voucher.
     * @return voucherDetail detail of the voucher.
     */
    function getDetail(
        uint256 voucherId
    ) external view returns (VoucherDetail memory voucherDetail);

    /**
     * @dev Calculate the voucher id from arguments.
     * @param inputToken address of the input token.
     * @param inputAmount amount of the input token for each play.
     * @param repeats times of play.
     * @return voucherId id of the voucher.
     */
    function getId(
        address inputToken,
        uint256 inputAmount,
        uint256 repeats
    ) external pure returns (uint256 voucherId);

    /**
     * @dev Get the quantity of the voucher owned by the owner.
     * @param owner address of the owner.
     * @param voucherId id of the voucher.
     * @return quantity quantity of the voucher.
     */
    function get(
        address owner,
        uint256 voucherId
    ) external view returns (uint256 quantity);

    /**
     * @dev List the voucher ids and unused quantities of the owner.
     * @param owner address of the owner.
     * @return voucherIds ids of the vouchers.
     * @return quantities unused quantities of the vouchers.
     */
    function list(
        address owner
    )
        external
        view
        returns (uint256[] memory voucherIds, uint256[] memory quantities);

    /**
     * @dev Transfer the vouchers to a new owner.
     * @param voucherIds ids of vouchers.
     * @param quantities quantities of the vouchers.
     * @param newOwner address of the new owner.
     * EMIT VoucherTransferred event.
     */
    function transfer(
        uint256[] calldata voucherIds,
        uint256[] calldata quantities,
        address newOwner
    ) external;

    event VoucherTransferred(
        uint256[] voucherIds,
        uint256[] quantities,
        address newOwner
    );

    /**
     * @dev Play with the voucher.
     * @param player address of the player.
     * @param voucherId id of the voucher.
     * @param outputToken address of the output token.
     * @param table a valid probability table.
     * @return playId id of the play.
     * EMIT PlayRequested event.
     */
    function play(
        address player,
        uint256 voucherId,
        address outputToken,
        ICore.ProbabilityTable calldata table
    ) external returns (uint256 playId);

    event PlayRequested(
        address player,
        uint256 voucherId,
        address outputToken,
        uint256 playId
    );

    /**
     * @dev Set the address of the Xbit contract.
     * @param xbit address of the Xbit contract.
     */
    function setXbitAddress(address xbit) external; // onlyMaintainer

    event XbitAddressSet(address xbit);

    /**
     * @dev Get the nominal balance of the token.
     * @param token address of the token.
     */
    function nominalBalance(
        address token
    ) external view returns (uint256 balance); // onlyMaintainer

    /**
     * @dev Withdraw the token without affecting the nominal balance.
     * @param token address of the token.
     * @param amount amount of the token to withdraw.
     */
    function withdraw(address token, uint256 amount) external; // onlyMaintainer
}
