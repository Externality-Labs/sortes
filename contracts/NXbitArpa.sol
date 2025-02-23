// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./NXbit.sol";
import "./IWETH.sol";
import {GeneralRandcastConsumerBase, BasicRandcastConsumerBase, IAdapter} from "./arpa/user/GeneralRandcastConsumerBase.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

contract NXbitArpa is NXbit, GeneralRandcastConsumerBase {
    // Arpa variables
    uint256 internal arpaThreshold = 1e16;

    // === Basic functions ===
    constructor(
        TokenAddress memory addresses,
        address _addr_uniswap_swaprouter02,
        address _addr_chainlink_aggregator,
        address _addr_arpa_adapter
    )
        NXbit(addresses, _addr_uniswap_swaprouter02, _addr_chainlink_aggregator)
        BasicRandcastConsumerBase(_addr_arpa_adapter)
    {}

    function setArpaSubscription(uint256 _arpaThreshold) public {
        require(
            msg.sender == MAINTAINER_ADDRESS || msg.sender == owner(),
            "only maintainer or owner can set Arpa subscription"
        );
        arpaThreshold = _arpaThreshold;
    }

    // === Reward functions ===
    function _fulfillRandomness(
        bytes32 requestId,
        uint256 randomness
    ) internal override {
        afterRandom(uint256(requestId), randomness);
    }

    function fundArpaSubscription(uint256 amount) internal {
        _weth.withdraw(amount);
        uint64 subId = IAdapter(adapter).getLastSubscription(address(this));
        IAdapter(adapter).fundSubscription{value: amount}(subId);
    }

    function fundSubscription(
        uint256 usd_amount,
        uint8 usdType
    ) internal override returns (uint256) {
        uint64 subId = IAdapter(adapter).getLastSubscription(address(this));
        uint256 balance;
        (, , balance, , , , , , ) = IAdapter(adapter).getSubscription(subId);

        if (balance < arpaThreshold) {
            uint256 amount_weth = convertUSD2WETH(usd_amount, usdType);
            fundArpaSubscription(amount_weth);
        }
        return 0;
    }

    function requestRandomWords() internal override returns (uint256) {
        bytes memory params;
        return uint256(_requestRandomness(RequestType.Randomness, params));
    }
}
