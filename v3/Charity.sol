// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "./ICore.sol";
import "./ISortes.sol";
import "./IVoucher.sol";
import "./ICharity.sol";
import "./utils/Maintainable.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

contract Charity is ICharity, Maintainable {
    uint256 internal constant M = 1e6;
    IERC20Metadata internal _xexp;
    IERC20Metadata internal _good;
    uint256 internal xexpUnit;
    uint256 internal goodUnit;
    ICore internal _xbit;
    ISortes internal _sortes;
    IVoucher internal _voucher;

    Parameters internal _params;

    constructor() ConfirmedOwner(msg.sender) {}

    function setupParams(
        Parameters calldata p
    ) external override onlyMaintainer {
        _params = p;
        _xexp = IERC20Metadata(p.xexp);
        _good = IERC20Metadata(p.good);
        xexpUnit = 10 ** _xexp.decimals();
        goodUnit = 10 ** _good.decimals();
        _xbit = ICore(p.xbit);
        _voucher = IVoucher(p.voucher);
        _sortes = ISortes(p.sortes);
    }

    function getParams()
        external
        view
        override
        onlyMaintainer
        returns (Parameters memory p)
    {
        p = _params;
    }

    function playWithToken(
        address inputToken,
        uint256 inputAmount,
        uint256 repeats,
        address outputToken,
        ICore.ProbabilityTable calldata table,
        uint256 donationId
    ) external override returns (uint256 playId) {
        TransferHelper.safeTransferFrom(
            inputToken,
            msg.sender,
            address(this),
            inputAmount * repeats
        );
        TransferHelper.safeApprove(
            inputToken,
            address(_xbit),
            inputAmount * repeats
        );
        playId = _xbit.play(
            msg.sender,
            inputToken,
            inputAmount,
            repeats,
            outputToken,
            table
        );
        finishPlay(playId, donationId);
    }

    function playWithVoucher(
        uint256 voucherId,
        address outputToken,
        ICore.ProbabilityTable calldata table,
        uint256 donationId
    ) external override returns (uint256 playId) {
        playId = _voucher.play(msg.sender, voucherId, outputToken, table);
        finishPlay(playId, donationId);
    }

    function finishPlay(uint256 playId, uint256 donationId) internal {
        uint256 xexpAmount = _xbit.getPlayStatusById(playId).outputXexpAmount;
        (uint256 usdAmount, uint256 goodAmount) = _sortes.voteDonation(
            donationId,
            xexpAmount
        );

        emit PlayResult(playId, donationId, xexpAmount, usdAmount, goodAmount);
    }
}
