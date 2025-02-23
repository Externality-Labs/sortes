// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {GeneralRandcastConsumerBase, BasicRandcastConsumerBase, IAdapter} from "./arpa/user/GeneralRandcastConsumerBase.sol";

contract RandcastExperiment is GeneralRandcastConsumerBase {
    /* requestId -> randomness */
    mapping(uint256 => uint256) public randomResults;
    uint256 internal resultLength = 0;

    event RequestedRandomness(uint256 reqId, address invoker);

    // solhint-disable-next-line no-empty-blocks
    constructor(address adapter) BasicRandcastConsumerBase(adapter) {}

    /**
     * Requests randomness
     */
    function getRandomNumber() external returns (uint256) {
        bytes memory params;
        uint256 reqId = uint256(
            _requestRandomness(RequestType.Randomness, params)
        );
        emit RequestedRandomness(reqId, msg.sender);
        return reqId;
    }

    /**
     * Callback function used by Randcast Adapter
     */
    function _fulfillRandomness(
        bytes32 requestId,
        uint256 randomness
    ) internal override {
        randomResults[uint256(requestId)] = randomness;
        resultLength += 1;
    }

    function lengthOfRandomnessResults() public view returns (uint256) {
        return resultLength;
    }

    function getRandomnessResult(
        uint256 requestId
    ) public view returns (uint256) {
        return randomResults[requestId];
    }

    function getSubscriptionBalance() public view returns (uint256) {
        uint64 subId = IAdapter(adapter).getLastSubscription(address(this));
        uint256 balance;
        (, , balance, , , , , , ) = IAdapter(adapter).getSubscription(subId);
        return balance;
    }

    function fundSubscription(uint256 amount) public {
        uint64 subId = IAdapter(adapter).getLastSubscription(address(this));
        IAdapter(adapter).fundSubscription{value: amount}(subId);
    }
}
