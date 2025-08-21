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
    uint256 internal halfLife = 365 days / 2;

    Receiver[] internal _receivers;
    mapping(address => uint256[]) internal _user2ReceiverIds;

    Donation[] internal _donations;
    mapping(address => uint256[]) internal _user2DonationIds;

    mapping(address => uint256) internal _user2lastClaim;
    mapping(address => uint256) internal _user2unclaimedGood;

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
        halfLife = p.halfLife;
        initiatedLifetime = (p.gInitiateDonation * 1 days) / p.gCostPerDay;
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
            (goodAmount * 1 days) /
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
    ) external override returns (uint256 usdAmount, uint256 goodAmount) {
        require(donationId < _donations.length, "Sortes: invalid donationId");
        require(xexpAmount >= _params.eVoteMin, "Sortes: xexpAmount too small");
        Donation storage donation = _donations[donationId];
        require(donation.isExecuted == false, "Sortes: donation is executed");
        require(
            donation.expireTime > block.timestamp,
            "Sortes: donation is expired"
        );

        goodAmount = _convertXexpToGood(xexpAmount);
        usdAmount =
            (xexpAmount * usdUnit * _params.mUsdXexpRate) /
            (xexpUnit * M);
        donation.currentAmount += usdAmount;

        emit DonationVoted(
            tx.origin,
            donationId,
            xexpAmount,
            usdAmount,
            goodAmount
        );
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
    ) external override returns (uint256 goodAmount) {
        return _convertXexpToGood(xexpAmount);
    }

    function _convertXexpToGood(
        uint256 xexpAmount
    ) private returns (uint256 goodAmount) {
        require(xexpAmount > 0, "Sortes: xexpAmount is zero");

        // must claim good before converting
        _claimGood();

        goodAmount = amm(xexpAmount);
        _user2unclaimedGood[tx.origin] += goodAmount;

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

        emit GoodConverted(tx.origin, xexpAmount, goodAmount);
    }

    function getUnclaimedGood(
        address user
    )
        external
        view
        override
        returns (uint256 unclaimedGood, uint256 claimableGood)
    {
        return _getGood(user);
    }

    function _getGood(
        address user
    ) private view returns (uint256 unclaimedGood, uint256 claimableGood) {
        unclaimedGood = _user2unclaimedGood[user];
        if (block.timestamp < _params.tGlobalClaimLockDeadline) {
            return (unclaimedGood, 0);
        }

        uint256 t = block.timestamp -
            Math.max(_params.tGlobalClaimLockDeadline, _user2lastClaim[user]);
        claimableGood = unclaimedGood - decay(unclaimedGood, t);
    }

    function claimGood() external override {
        _claimGood();
    }

    function _claimGood() private {
        if (block.timestamp < _params.tGlobalClaimLockDeadline) {
            emit GoodClaimed(tx.origin, block.timestamp, 0);
            return;
        }

        (uint256 unclaimedGood, uint256 claimableGood) = _getGood(tx.origin);
        TransferHelper.safeTransfer(address(_good), tx.origin, claimableGood);

        _user2unclaimedGood[tx.origin] = unclaimedGood - claimableGood;
        _user2lastClaim[tx.origin] = block.timestamp;
        _goodClaimedTotal += claimableGood;
        _address2goodClaimed[tx.origin] += claimableGood;
        emit GoodClaimed(tx.origin, block.timestamp, claimableGood);
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

    /**
     * @dev Decay function to calculate the remaining value after a certain time.
     * @param n initial value.
     * @param t time passed.
     * @return r remaining value after decay.
     */
    function decay(uint256 n, uint256 t) internal view returns (uint256 r) {
        n >>= (t / halfLife);
        r = n - (n * (t % halfLife)) / halfLife / 2;
    }
}
