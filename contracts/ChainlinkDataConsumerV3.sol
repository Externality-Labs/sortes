// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED
 * VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */

/**
 * If you are reading data feeds on L2 networks, you must
 * check the latest answer from the L2 Sequencer Uptime
 * Feed to ensure that the data is accurate in the event
 * of an L2 sequencer outage. See the
 * https://docs.chain.link/data-feeds/l2-sequencer-feeds
 * page for details.
 */

contract ChainlinkDataConsumerV3 {
    AggregatorV3Interface internal aggregator;

    /**
     * Network: Arbitrum-Sepolia
     * Aggregator: BTC/USD
     * Address: 0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69
     */
    constructor() {
        aggregator = AggregatorV3Interface(
            0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69
        );
    }

    /**
     * Returns the latest answer.
     */
    function getChainlinkDataFeedLatest()
        public
        view
        returns (uint8 decimals, int256 answer, string memory description)
    {
        decimals = aggregator.decimals();
        // prettier-ignore
        (
            /* uint80 roundID */,
            answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = aggregator.latestRoundData();
        description = aggregator.description();
    }

    function estimateUSDT2WBTC(uint amountIn) public view returns (uint) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int256 answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = aggregator.latestRoundData();

        return
            (amountIn * 10 ** (aggregator.decimals() + 8 - 6)) /
            uint256(answer);
    }
}
