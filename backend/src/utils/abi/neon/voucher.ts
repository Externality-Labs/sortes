const voucherAbi = [
  // events
  'event VoucherIssued(uint256 voucherId, address inputToken, uint256 inputAmount, uint256 repeats, uint256 quantity)',
  'event VoucherTransferred(uint256[] voucherIds, uint256[] quantities, address newOwner)',
  'event PlayRequested(address player, uint256 voucherId, address outputToken, uint256 tableId, uint256 playId)',
  'event ShootRequested(address player, uint256 voucherId, address outputToken, uint256 outputAmount, uint256 shootId)',
  // functions
  // Issue vouchers. [EMIT VoucherIssued event]
  'function issue(address inputToken, uint256 inputAmount, uint256 repeats, uint256 quantity) external returns (uint256 voucherId)',
  // Get the voucher detail.
  'function getDetail(uint256 voucherId) external view returns (tuple(uint256 id, address inputToken, uint256 inputAmount, uint256 repeats) voucherDetail)',
  // Get the voucher id from arguments.
  'function getId(address inputToken, uint256 inputAmount, uint256 repeats) external pure returns (uint256 voucherId)',
  // Get the voucher quantity of the owner.
  'function get(address owner, uint256 voucherId) external view returns (uint256 quantity)',
  // List the unused voucher ids and quantities of the owner.
  'function list(address owner) external view returns (uint256[] voucherIds, uint256[] quantities)',
  // Transfer the vouchers to a new owner, sender must be the old owner. [EMIT VoucherTransferred event]
  'function transfer(uint256[] voucherIds, uint256[] quantities, address newOwner) external',
  // Request to play with the voucher. [EMIT PlayRequested event]
  'function play(address player, uint256 voucherId, address outputToken, uint256 tableId) external returns (uint256 playId)',
  // Request to shoot with the voucher. [EMIT ShootRequested event]
  'function shoot(address player, uint256 voucherId, address outputToken, uint256 outputAmount) external returns (uint256 shootId)',
];

export const voucherAdminAbi = [
  ...voucherAbi,
  'function setMaintainer(address newMaintainer) public',
  'function setXbitAddress(address xbit) external',
  'function nominalBalance(address token) external view returns (uint256 balance)',
  'function withdraw(address token, uint256 amount) external',
];

/*
struct VoucherDetail {
    uint256 id; // a hash value
    address inputToken;
    uint256 inputAmount;
    uint256 repeats;
}
=> tuple(uint256 id, address inputToken, uint256 inputAmount, uint256 repeats)
*/
export default voucherAbi;
