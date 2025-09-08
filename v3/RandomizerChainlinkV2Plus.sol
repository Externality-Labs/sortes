// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./IWETH.sol";
import "./Randomizer.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

abstract contract RandomizerChainlinkV2Plus is
    Randomizer,
    VRFConsumerBaseV2Plus
{
    IWETH internal _wgas;

    // Chainlink variables
    uint256 internal subscriptionId;
    bytes32 internal keyHash;
    uint32 internal callbackGasLimit;
    uint256 internal gasThreshold;
    uint16 internal requestConfirmations = 3;
    uint32 internal numWords = 1;

    event ChainlinkFunded(uint256 amount);

    // === Randomizer functions ===

    constructor(
        address _addr_wgas,
        address _addr_chainlink_vrfCoordinator
    ) VRFConsumerBaseV2Plus(_addr_chainlink_vrfCoordinator) {
        _wgas = IWETH(_addr_wgas);
    }

    function requestRandomness() internal override returns (uint256 requestId) {
        requestId = requestRandomWords();
        emit RandomnessRequested(requestId);
    }

    function belowThreshold() internal view override returns (bool) {
        uint96 balance;
        (, balance, , , ) = s_vrfCoordinator.getSubscription(subscriptionId);

        return balance < gasThreshold;
    }

    function fund(uint256 amount) internal override {
        fundChainlinkSubscription(amount);
        emit ChainlinkFunded(amount);
    }

    // === Chainlink functions ===

    function setChainlinkSubscription(
        uint256 _subscriptionId,
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        uint256 _gasThreshold
    ) public onlyMaintainer {
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        callbackGasLimit = _callbackGasLimit;
        gasThreshold = _gasThreshold;
    }

    function fundChainlinkSubscription(uint256 amount) internal {
        _wgas.withdraw(amount);
        s_vrfCoordinator.fundSubscriptionWithNative{value: amount}(
            subscriptionId
        );
    }

    function requestRandomWords() internal returns (uint256) {
        return
            s_vrfCoordinator.requestRandomWords(
                VRFV2PlusClient.RandomWordsRequest({
                    keyHash: keyHash,
                    subId: subscriptionId,
                    requestConfirmations: requestConfirmations,
                    callbackGasLimit: callbackGasLimit,
                    numWords: numWords,
                    extraArgs: VRFV2PlusClient._argsToBytes(
                        // Set nativePayment to true to pay for VRF requests with Sepolia ETH instead of LINK
                        VRFV2PlusClient.ExtraArgsV1({nativePayment: true})
                    )
                })
            );
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        fulfillRandomness(requestId, randomWords[0]);
    }
}
