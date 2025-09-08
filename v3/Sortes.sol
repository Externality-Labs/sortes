// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

import "./ISortes.sol";
import "./ILocker.sol";
import "./utils/Maintainable.sol";

contract Sortes is ISortes, Maintainable {
    uint256 internal constant M = 1e6;
    IERC20Metadata internal _xexp;
    IERC20Metadata internal _good;
    IERC20Metadata internal _usd;
    uint256 internal xexpUnit;
    uint256 internal goodUnit;
    uint256 internal usdUnit;
    uint256 internal _xexpReserved;
    ILocker internal _locker;
    Parameters internal _params;

    Donation[] internal _donations;
    mapping(address => uint256[]) internal _user2DonationIds;

    uint256 internal _xexpSpentTotal;
    mapping(address => uint256) internal _address2XexpSpent;

    constructor() ConfirmedOwner(msg.sender) {}

    // === maintenance related ===

    function setupParams(
        Parameters calldata p
    ) external override onlyMaintainer {
        _params = p;
        _xexp = IERC20Metadata(p.xexp);
        _good = IERC20Metadata(p.good);
        _usd = IERC20Metadata(p.usd);
        xexpUnit = 10 ** _xexp.decimals();
        goodUnit = 10 ** _good.decimals();
        usdUnit = 10 ** _usd.decimals();
        _locker = ILocker(p.locker);
        _xexpReserved = p.xexpReserved;
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

    function activate(
        uint256 donationId,
        bool value
    ) external override onlyMaintainer {
        require(donationId < _donations.length, "Sortes: invalid donationId");
        _donations[donationId].isActivated = value;
    }

    function withdraw(
        address token,
        uint256 amount
    ) external override onlyMaintainer {
        TransferHelper.safeTransfer(token, tx.origin, amount);
    }

    // === donation related ===

    function initiateDonation(
        address receiver
    ) external override returns (uint256 donationId) {
        donationId = _donations.length;
        _user2DonationIds[msg.sender].push(donationId);

        _donations.push(
            Donation({
                id: donationId,
                receiver: receiver,
                initiator: msg.sender,
                currentAmount: 0,
                startTime: block.timestamp,
                endTime: 0,
                isActivated: true,
                isExecuted: false
            })
        );

        emit DonationInitiated(_donations[donationId]);
    }

    function getDonationsTotal() external view override returns (uint256) {
        return _donations.length;
    }

    function listDonations(
        address user
    ) external view override returns (Donation[] memory donations) {
        uint256[] memory ids = _user2DonationIds[user];
        uint256 length = ids.length;
        donations = new Donation[](length);
        for (uint256 i = 0; i < length; i++) {
            donations[i] = _donations[ids[i]];
        }
    }

    function getDonations(
        uint256[] calldata ids
    ) external view override returns (Donation[] memory donations) {
        uint256 length = ids.length;
        donations = new Donation[](length);
        for (uint256 i = 0; i < length; i++) {
            donations[i] = _donations[ids[i]];
        }
    }

    function voteDonation(
        uint256 donationId,
        uint256 playId,
        uint256 xexpAmount
    ) external override returns (uint256 usdAmount, uint256 goodAmount) {
        require(donationId < _donations.length, "Sortes: invalid donationId");
        Donation storage donation = _donations[donationId];
        require(donation.isActivated, "Sortes: donation is not activated");
        require(donation.isExecuted == false, "Sortes: donation is executed");

        goodAmount = _convertGoodAndLock(xexpAmount);
        usdAmount = (xexpAmount * usdUnit) / (xexpUnit * 100);
        donation.currentAmount += usdAmount;

        emit DonationVoted(
            tx.origin,
            donationId,
            playId,
            xexpAmount,
            usdAmount,
            goodAmount
        );
    }

    function closeDonation(uint256 donationId) external override {
        require(donationId < _donations.length, "Sortes: invalid donationId");
        Donation storage donation = _donations[donationId];
        require(
            msg.sender == donation.initiator,
            "Sortes: sender is not the initiator"
        );
        require(donation.isActivated, "Sortes: donation is not activated");
        require(donation.isExecuted == false, "Sortes: donation is executed");

        donation.endTime = block.timestamp;
        donation.isExecuted = true;

        // execute the donation
        TransferHelper.safeTransfer(
            address(_usd),
            donation.receiver,
            donation.currentAmount
        );

        emit DonationClosed(donation);
    }

    // === good related ===

    function amm(
        uint256 xexpAmount
    ) public view override returns (uint256 goodAmount) {
        // (x−Δx)⋅(y+Δy)=x⋅y; Δx=xΔy/(y+Δy)
        return
            (_good.balanceOf(address(this)) * xexpAmount) /
            (_xexpReserved + _xexpSpentTotal + xexpAmount);
    }

    function convertGoodAndLock(
        uint256 xexpAmount
    ) external override returns (uint256 goodAmount) {
        return _convertGoodAndLock(xexpAmount);
    }

    function _convertGoodAndLock(
        uint256 xexpAmount
    ) private returns (uint256 goodAmount) {
        require(xexpAmount > 0, "Sortes: xexpAmount is zero");
        require(
            _xexp.balanceOf(tx.origin) >=
                _address2XexpSpent[tx.origin] + xexpAmount,
            "Sortes: insufficient XEXP"
        );

        goodAmount = amm(xexpAmount);
        _xexpSpentTotal += xexpAmount;
        _address2XexpSpent[tx.origin] += xexpAmount;

        TransferHelper.safeApprove(
            address(_good),
            address(_locker),
            goodAmount
        );
        _locker.lockToken(tx.origin, goodAmount);

        emit GoodConverted(tx.origin, xexpAmount, goodAmount);
    }
}
