// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

import "./ILocker.sol";
import "./utils/Maintainable.sol";

contract Locker is ILocker, Maintainable {
    IERC20Metadata internal _token;
    uint256 internal tokenUnit;
    Parameters internal _params;

    uint256 internal _halfLife = 365 days / 2;
    uint256 internal _globalLockDeadline = 0;

    mapping(address => uint256) internal _user2lastClaimTimestamp;
    mapping(address => uint256) internal _user2unclaimedAmount;
    mapping(address => uint256) internal _address2receivedAmount;
    mapping(address => uint256) internal _address2claimedAmount;

    uint256 internal _tokenReceivedTotal;
    uint256 internal _tokenClaimedTotal;

    constructor() ConfirmedOwner(msg.sender) {}

    function setupParams(
        Parameters calldata p
    ) external override onlyMaintainer {
        _params = p;
        _token = IERC20Metadata(p.token);
        tokenUnit = 10 ** _token.decimals();
        _halfLife = p.halfLife;
        _globalLockDeadline = p.globalLockDeadline;
    }

    function getParams()
        external
        view
        override
        onlyMaintainer
        returns (Parameters memory p)
    {
        return _params;
    }

    function lockToken(address user, uint256 tokenAmount) external override {
        require(address(_token) != address(0), "Locker: token address not set");
        require(tokenAmount > 0, "Locker: tokenAmount is zero");

        _claimToken(user); // claim all claimable token so every token is freshly locked
        TransferHelper.safeTransferFrom(
            address(_token),
            msg.sender,
            address(this),
            tokenAmount
        );

        _user2unclaimedAmount[user] += tokenAmount;
        _tokenReceivedTotal += tokenAmount;
        _address2receivedAmount[user] += tokenAmount;
        emit TokenLocked(user, tokenAmount, block.timestamp);
    }

    function queryToken(
        address user
    )
        external
        view
        override
        returns (uint256 lockedAmount, uint256 claimableAmount)
    {
        return _queryToken(user);
    }

    function _queryToken(
        address user
    ) internal view returns (uint256 lockedAmount, uint256 claimableAmount) {
        uint256 unclaimedAmount = _user2unclaimedAmount[user];
        if (block.timestamp < _globalLockDeadline) {
            return (unclaimedAmount, 0);
        }

        uint256 t = block.timestamp -
            Math.max(_globalLockDeadline, _user2lastClaimTimestamp[user]);
        lockedAmount = decay(unclaimedAmount, t);
        claimableAmount = unclaimedAmount - lockedAmount;
    }

    function claimToken(address user) external override {
        _claimToken(user);
    }

    function _claimToken(address user) internal {
        if (block.timestamp < _globalLockDeadline) {
            emit TokenClaimed(user, 0, block.timestamp);
            return;
        }

        (uint256 lockedAmount, uint256 claimableAmount) = _queryToken(user);
        TransferHelper.safeTransfer(address(_token), user, claimableAmount);

        _user2unclaimedAmount[user] = lockedAmount;
        _user2lastClaimTimestamp[user] = block.timestamp;
        _tokenClaimedTotal += claimableAmount;
        _address2claimedAmount[user] += claimableAmount;
        emit TokenClaimed(user, claimableAmount, block.timestamp);
    }

    function getTotalHistory()
        external
        view
        returns (uint256 receivedAmount, uint256 claimedAmount)
    {
        receivedAmount = _tokenReceivedTotal;
        claimedAmount = _tokenClaimedTotal;
    }

    function getUserHistory(
        address user
    ) external view returns (uint256 receivedAmount, uint256 claimedAmount) {
        receivedAmount = _address2receivedAmount[user];
        claimedAmount = _address2claimedAmount[user];
    }

    /**
     * @dev Decay function to calculate the remaining value after a certain time.
     * @param n initial value.
     * @param t time passed.
     * @return r remaining value after decay.
     */
    function decay(uint256 n, uint256 t) internal view returns (uint256 r) {
        n >>= (t / _halfLife);
        r = n - (n * (t % _halfLife)) / _halfLife / 2;
    }
}
