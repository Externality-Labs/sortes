// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./NXbit.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract NXbitChainlinkV2Plus is NXbit, VRFConsumerBaseV2Plus {
    // Chainlink variables
    uint256 internal subscriptionId;
    bytes32 internal keyHash;
    uint32 internal callbackGasLimit;
    uint256 internal linkThreshold;
    uint16 internal requestConfirmations = 3;
    uint32 internal numWords = 1;

    // === Basic functions ===
    constructor(
        TokenAddress memory addresses,
        address _addr_uniswap_swaprouter02,
        address _addr_chainlink_aggregator,
        address _addr_chainlink_vrfCoordinator
    )
        NXbit(addresses, _addr_uniswap_swaprouter02, _addr_chainlink_aggregator)
        VRFConsumerBaseV2Plus(_addr_chainlink_vrfCoordinator)
    {}

    function setChainlinkSubscription(
        uint256 _subscriptionId,
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        uint256 _linkThreshold
    ) public {
        require(
            msg.sender == MAINTAINER_ADDRESS || msg.sender == owner(),
            "only maintainer or owner can set Chainlink subscription"
        );
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        callbackGasLimit = _callbackGasLimit;
        linkThreshold = _linkThreshold;
    }

    // === Reward functions ===
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        afterRandom(requestId, randomWords[0]);
    }

    function fundChainlinkSubscription(uint256 amount) internal {
        _link.transferAndCall(
            address(s_vrfCoordinator),
            amount,
            abi.encode(subscriptionId)
        );
    }

    function fundSubscription(
        uint256 usd_amount,
        uint8 usdType
    ) internal override returns (uint256) {
        uint96 balance;
        (balance, , , , ) = s_vrfCoordinator.getSubscription(subscriptionId);

        // fund subscription if balance is less than linkThreshold
        if (balance < linkThreshold) {
            uint256 amount_link = convertUSD2LINK(usd_amount, usdType);
            fundChainlinkSubscription(amount_link);
            return usd_amount;
        }
        return 0;
    }

    function requestRandomWords() internal override returns (uint256) {
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
                        VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                    )
                })
            );
    }
}
