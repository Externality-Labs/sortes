//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2Mock.sol";
import "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import "@chainlink/contracts/src/v0.8/shared/token/ERC677/LinkToken.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/IERC677Receiver.sol";

contract VRFCoordinatorV2ERC677ReceiverMock is
    VRFCoordinatorV2Mock,
    IERC677Receiver
{
    constructor(
        uint96 _baseFee,
        uint96 _gasPriceLink
    ) VRFCoordinatorV2Mock(_baseFee, _gasPriceLink) {}

    function onTokenTransfer(
        address,
        uint256 amount,
        bytes calldata data
    ) external override {
        uint64 subId = abi.decode(data, (uint64));
        fundSubscription(subId, uint96(amount));
    }
}
