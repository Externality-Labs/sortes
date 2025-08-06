// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

import "./ISortes.sol";
import "./utils/Maintainable.sol";

contract Sortes is ISortes, Maintainable {
    uint256 internal constant M = 1e6;
    IERC20Metadata internal _xexp;
    IERC20Metadata internal _good;
    IERC20Metadata internal _usd;
    uint256 internal xexpUnit;
    uint256 internal goodUnit;
    uint256 internal usdUnit;
    Parameters internal _params;
    uint256 internal initiatedLifetime = 0;

    Receiver[] internal _receivers;
    mapping(address => uint256[]) internal _user2ReceiverIds;

    Donation[] internal _donations;
    mapping(address => uint256[]) internal _user2DonationIds;

    Locker[] internal _lockers;
    mapping(address => uint256[]) internal _user2lockerIds;

    uint256 internal _xexpSpentTotal;
    uint256 internal _goodRedeemedTotal;
    uint256 internal _goodClaimedTotal;
    mapping(address => uint256) internal _address2xexpSpent;
    mapping(address => uint256) internal _address2goodRedeemed;
    mapping(address => uint256) internal _address2goodClaimed;

    constructor() ConfirmedOwner(msg.sender) {}

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
        initiatedLifetime = (p.gInitiateDonation * 86400) / p.gCostPerDay;
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

    // === receiver related ===

    function registerReceiver(
        address receiver
    ) external override returns (uint256 receiverId) {
        TransferHelper.safeTransferFrom(
            address(_good),
            tx.origin,
            maintainer(),
            _params.gRegisterReceiver
        );

        receiverId = _receivers.length;
        _user2ReceiverIds[tx.origin].push(receiverId);
        _receivers.push(
            Receiver({id: receiverId, receiver: receiver, creator: tx.origin})
        );

        emit ReceiverRegistered(_receivers[receiverId]);
    }

    function getReceiversTotal() external view override returns (uint256) {
        return _receivers.length;
    }

    function listReceivers(
        address user
    ) external view override returns (Receiver[] memory receivers) {
        uint256[] memory receiverIds = _user2ReceiverIds[user];
        uint256 length = receiverIds.length;
        receivers = new Receiver[](length);
        for (uint256 i = 0; i < length; i++) {
            receivers[i] = _receivers[receiverIds[i]];
        }
    }

    function getReceivers(
        uint256[] calldata ids
    ) external view override returns (Receiver[] memory receivers) {
        uint256 length = ids.length;
        receivers = new Receiver[](length);
        for (uint256 i = 0; i < length; i++) {
            receivers[i] = _receivers[ids[i]];
        }
    }

    function requestReceiverVerification(uint256 id) external override {
        require(id < _receivers.length, "Sortes: invalid receiverId");

        TransferHelper.safeTransferFrom(
            address(_good),
            tx.origin,
            maintainer(),
            _params.gVerifyReceiver
        );

        emit ReceiverVerificationRequested(_receivers[id]);
    }

    // === donation related ===

    function initiateDonation(
        address receiver
    ) external override returns (uint256 donationId) {
        TransferHelper.safeTransferFrom(
            address(_good),
            tx.origin,
            maintainer(),
            _params.gInitiateDonation
        );

        donationId = _donations.length;
        _user2DonationIds[tx.origin].push(donationId);

        _donations.push(
            Donation({
                id: donationId,
                receiver: receiver,
                initiator: tx.origin,
                currentAmount: 0,
                startTime: block.timestamp,
                expireTime: block.timestamp + initiatedLifetime,
                isValid: true,
                isExecuted: false
            })
        );

        emit DonationInitiated(_donations[donationId]);
    }

    function extendDonation(
        uint256 donationId,
        uint256 goodAmount
    ) external override {
        require(donationId < _donations.length, "Sortes: invalid donationId");
        Donation storage donation = _donations[donationId];
        require(donation.isExecuted == false, "Sortes: donation is executed");

        TransferHelper.safeTransferFrom(
            address(_good),
            tx.origin,
            maintainer(),
            goodAmount
        );
        donation.expireTime =
            Math.max(donation.expireTime, block.timestamp) +
            (goodAmount * 86400) /
            _params.gCostPerDay;

        emit DonationExtended(donation);
    }

    function getDonationsTotal() external view override returns (uint256) {
        return _donations.length;
    }

    function listDonations(
        address user
    ) external view override returns (Donation[] memory donations) {
        uint256[] memory donationIds = _user2DonationIds[user];
        uint256 length = donationIds.length;
        donations = new Donation[](length);
        for (uint256 i = 0; i < length; i++) {
            donations[i] = _donations[donationIds[i]];
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
        uint256 xexpAmount
    ) external override returns (uint256 lockerId) {
        require(donationId < _donations.length, "Sortes: invalid donationId");
        require(xexpAmount >= _params.eVoteMin, "Sortes: xexpAmount too small");
        Donation storage donation = _donations[donationId];
        require(donation.isExecuted == false, "Sortes: donation is executed");
        require(
            donation.expireTime > block.timestamp,
            "Sortes: donation is expired"
        );

        (, lockerId) = _convertXexpToGood(xexpAmount);

        uint256 usdAmount = (xexpAmount * usdUnit * _params.mUsdXexpRate) /
            (xexpUnit * M);
        donation.currentAmount += usdAmount;

        emit DonationVoted(tx.origin, donationId, xexpAmount, usdAmount);
    }

    function closeDonation(uint256 donationId) external override {
        require(donationId < _donations.length, "Sortes: invalid donationId");
        Donation storage donation = _donations[donationId];
        require(
            tx.origin == donation.initiator,
            "Sortes: sender is not the initiator"
        );
        require(donation.isExecuted == false, "Sortes: donation is executed");

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
        uint256 xexpTotalAmount = _xexp.balanceOf(address(this));
        uint256 goodTotalAmount = _good.balanceOf(address(this)) +
            _goodClaimedTotal -
            _goodRedeemedTotal;

        goodAmount =
            (goodTotalAmount * xexpAmount) /
            (xexpTotalAmount + xexpAmount);
    }

    function convertXexpToGood(
        uint256 xexpAmount
    ) external override returns (uint256 goodAmount, uint256 lockerId) {
        return _convertXexpToGood(xexpAmount);
    }

    function _convertXexpToGood(
        uint256 xexpAmount
    ) private returns (uint256 goodAmount, uint256 lockerId) {
        require(xexpAmount > 0, "Sortes: xexpAmount is zero");

        goodAmount = amm(xexpAmount);
        lockerId = _lockers.length;
        _user2lockerIds[tx.origin].push(lockerId);
        _lockers.push(
            Locker({
                id: lockerId,
                owner: tx.origin,
                startTime: block.timestamp,
                xexpAmount: xexpAmount,
                totalAmount: goodAmount,
                claimedAmount: 0
            })
        );

        TransferHelper.safeTransferFrom(
            address(_xexp),
            tx.origin,
            address(this),
            xexpAmount
        );

        _xexpSpentTotal += xexpAmount;
        _address2xexpSpent[tx.origin] += xexpAmount;
        _goodRedeemedTotal += goodAmount;
        _address2goodRedeemed[tx.origin] += goodAmount;

        emit LockerCreated(tx.origin, xexpAmount, goodAmount, lockerId);
    }

    function listLockerIds(
        address user,
        bool claimableOnly
    ) public view override returns (uint256[] memory lockerIds) {
        if (!claimableOnly) {
            lockerIds = _user2lockerIds[user];
        } else {
            uint256[] memory allIds = _user2lockerIds[user];
            uint256[] memory tempIds = new uint256[](allIds.length);
            uint256 count = 0;
            for (uint256 i = 0; i < allIds.length; i++) {
                uint256 lockerId = allIds[i];
                Locker storage locker = _lockers[lockerId];
                if (locker.claimedAmount < locker.totalAmount) {
                    tempIds[count] = lockerId;
                    count++;
                }
            }
            lockerIds = new uint256[](count);
            for (uint256 i = 0; i < count; i++) {
                lockerIds[i] = tempIds[i];
            }
        }
    }

    function listLockers(
        address user,
        bool claimableOnly
    ) external view override returns (Locker[] memory lockers) {
        uint256[] memory lockerIds = listLockerIds(user, claimableOnly);
        lockers = getLockers(lockerIds);
    }

    function getLockers(
        uint256[] memory lockerIds
    ) public view override returns (Locker[] memory lockers) {
        lockers = new Locker[](lockerIds.length);
        for (uint256 i = 0; i < lockerIds.length; i++) {
            lockers[i] = _lockers[lockerIds[i]];
        }
    }

    function _claimLocker(
        uint256 lockerId
    ) private returns (uint256 claimedAmount) {
        require(lockerId < _lockers.length, "Sortes: invalid lockerId");
        Locker storage locker = _lockers[lockerId];
        require(locker.owner == tx.origin, "Sortes: not the owner");

        uint256 pastSeconds = Math.min(
            block.timestamp - locker.startTime,
            _params.durationSeconds
        );
        uint256 releasedAmount = (locker.totalAmount * pastSeconds) /
            _params.durationSeconds;
        claimedAmount = releasedAmount - locker.claimedAmount;
        locker.claimedAmount = releasedAmount;
        TransferHelper.safeTransfer(
            address(_good),
            locker.owner,
            claimedAmount
        );
    }

    function claimLockers(uint256[] calldata lockerIds) external override {
        require(lockerIds.length > 0, "Sortes: lockerIds is empty");
        require(
            block.timestamp > _params.tGlobalClaimLockDeadline,
            "Sortes: global claim lock deadline not reached"
        );
        uint256[] memory claimedAmounts = new uint256[](lockerIds.length);
        uint256 claimedTotalAmount = 0;
        for (uint256 i = 0; i < lockerIds.length; i++) {
            claimedAmounts[i] = _claimLocker(lockerIds[i]);
            claimedTotalAmount += claimedAmounts[i];
        }

        _goodClaimedTotal += claimedTotalAmount;
        _address2goodClaimed[tx.origin] += claimedTotalAmount;
        emit LockerClaimed(
            tx.origin,
            block.timestamp,
            lockerIds,
            claimedAmounts
        );
    }

    function getTotalBalances()
        external
        view
        override
        returns (uint256 xexpSpent, uint256 goodRedeemed, uint256 goodClaimed)
    {
        xexpSpent = _xexpSpentTotal;
        goodRedeemed = _goodRedeemedTotal;
        goodClaimed = _goodClaimedTotal;
    }

    function getUserBalances(
        address user
    )
        external
        view
        override
        returns (uint256 xexpSpent, uint256 goodRedeemed, uint256 goodClaimed)
    {
        xexpSpent = _address2xexpSpent[user];
        goodRedeemed = _address2goodRedeemed[user];
        goodClaimed = _address2goodClaimed[user];
    }

    function withdraw(
        address token,
        uint256 amount
    ) external override onlyMaintainer {
        TransferHelper.safeTransfer(token, tx.origin, amount);
    }
}
