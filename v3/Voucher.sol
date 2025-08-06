// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./IVoucher.sol";
import "./ICore.sol";
import "./utils/Maintainable.sol";
import "./Swapper.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

contract Voucher is IVoucher, Maintainable {
    ICore private _core;
    using EnumerableMap for EnumerableMap.UintToUintMap;

    mapping(uint256 => VoucherDetail) internal _voucherDetails;
    mapping(address => EnumerableMap.UintToUintMap) internal _owner2vouchers;
    mapping(address => uint256) internal _nominalBalance;

    constructor() ConfirmedOwner(msg.sender) {}

    function issue(
        address inputToken,
        uint256 inputAmount,
        uint256 repeats,
        uint256 quantity
    ) external override returns (uint256 voucherId) {
        require(inputAmount > 0, "Voucher: inputAmount is zero");
        require(repeats > 0, "Voucher: repeats is zero");
        require(quantity > 0, "Voucher: quantity is zero");
        require(
            Swapper(address(_core)).isValidInputToken(inputToken),
            "Voucher: invalid token"
        );

        TransferHelper.safeTransferFrom(
            inputToken,
            tx.origin,
            address(this),
            inputAmount * repeats * quantity
        );
        _nominalBalance[inputToken] += inputAmount * repeats * quantity;

        voucherId = getId(inputToken, inputAmount, repeats);
        if (_voucherDetails[voucherId].id == 0) {
            _voucherDetails[voucherId] = VoucherDetail({
                id: voucherId,
                inputToken: inputToken,
                inputAmount: inputAmount,
                repeats: repeats
            });
        }

        mint(tx.origin, voucherId, quantity);

        emit VoucherIssued(
            voucherId,
            inputToken,
            inputAmount,
            repeats,
            quantity
        );
    }

    function getDetail(
        uint256 voucherId
    ) external view override returns (VoucherDetail memory voucherDetail) {
        return _voucherDetails[voucherId];
    }

    function getId(
        address inputToken,
        uint256 inputAmount,
        uint256 repeats
    ) public pure override returns (uint256 voucherId) {
        return uint256(keccak256(abi.encode(inputToken, inputAmount, repeats)));
    }

    function get(
        address owner,
        uint256 voucherId
    ) external view override returns (uint256 quantity) {
        (, quantity) = EnumerableMap.tryGet(_owner2vouchers[owner], voucherId);
    }

    function list(
        address owner
    )
        external
        view
        override
        returns (uint256[] memory voucherIds, uint256[] memory quantities)
    {
        EnumerableMap.UintToUintMap storage vouchers = _owner2vouchers[owner];
        uint256 length = EnumerableMap.length(vouchers);
        voucherIds = EnumerableMap.keys(vouchers);
        quantities = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            quantities[i] = EnumerableMap.get(vouchers, voucherIds[i]);
        }
    }

    function transfer(
        uint256[] calldata voucherIds,
        uint256[] calldata quantities,
        address newOwner
    ) external override {
        require(
            voucherIds.length == quantities.length,
            "Voucher: voucherIds and quantities length mismatch"
        );

        for (uint256 i = 0; i < voucherIds.length; i++) {
            burn(tx.origin, voucherIds[i], quantities[i]);
            mint(newOwner, voucherIds[i], quantities[i]);
        }

        emit VoucherTransferred(voucherIds, quantities, newOwner);
    }

    function mint(address user, uint256 voucherId, uint256 quantity) internal {
        (, uint256 count) = EnumerableMap.tryGet(
            _owner2vouchers[user],
            voucherId
        );
        EnumerableMap.set(_owner2vouchers[user], voucherId, count + quantity);
    }

    function burn(address user, uint256 voucherId, uint256 quantity) internal {
        (, uint256 count) = EnumerableMap.tryGet(
            _owner2vouchers[user],
            voucherId
        );
        require(quantity > 0, "Voucher: quantity is zero");
        require(count >= quantity, "Voucher: insufficient quantity");
        if (count == quantity) {
            EnumerableMap.remove(_owner2vouchers[user], voucherId);
        } else {
            EnumerableMap.set(
                _owner2vouchers[user],
                voucherId,
                count - quantity
            );
        }
    }

    function play(
        address player,
        uint256 voucherId,
        address outputToken,
        ICore.ProbabilityTable calldata table
    ) external override returns (uint256 playId) {
        burn(tx.origin, voucherId, 1); // always burn 1 voucher of origin
        VoucherDetail memory detail = _voucherDetails[voucherId];
        _nominalBalance[detail.inputToken] -=
            detail.inputAmount *
            detail.repeats;
        TransferHelper.safeApprove(
            detail.inputToken,
            address(_core),
            detail.inputAmount * detail.repeats
        );
        playId = _core.play(
            player,
            detail.inputToken,
            detail.inputAmount,
            detail.repeats,
            outputToken,
            table
        );
        emit PlayRequested(player, voucherId, outputToken, playId);
    }

    function setXbitAddress(address xbit) external override onlyMaintainer {
        _core = ICore(xbit);
        emit XbitAddressSet(xbit);
    }

    function nominalBalance(
        address token
    ) external view override onlyMaintainer returns (uint256 balance) {
        return _nominalBalance[token];
    }

    function withdraw(
        address token,
        uint256 amount
    ) external override onlyMaintainer {
        TransferHelper.safeTransfer(token, tx.origin, amount);
    }
}
