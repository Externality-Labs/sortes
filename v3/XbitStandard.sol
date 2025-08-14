// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./CoreBase.sol";
import "./RandomizerChainlinkV2Plus.sol";
import "./SwapperUniswapV3.sol";

contract XbitStandard is CoreBase, RandomizerChainlinkV2Plus, SwapperUniswapV3 {
    constructor(
        address _addr_xexp,
        address _addr_weth,
        address _addr_chainlink_vrfCoordinator,
        address _addr_uniswap_swaprouter
    )
        CoreBase(_addr_xexp)
        RandomizerChainlinkV2Plus(_addr_weth, _addr_chainlink_vrfCoordinator)
        SwapperUniswapV3(_addr_uniswap_swaprouter)
    {}

    function swapAndFund(
        address inputToken,
        uint256 inputAmount,
        address outputToken
    ) internal override returns (uint256 outputAmount) {
        if (belowThreshold() && getLowerBound(inputToken) > 0) {
            uint256 fundAmount = Math.min(
                getLowerBound(inputToken) * 10,
                inputAmount - inputAmount / 10
            );
            outputAmount = swap(
                inputToken,
                inputAmount - fundAmount,
                outputToken
            );
            outputAmount =
                (outputAmount * inputAmount) /
                (inputAmount - fundAmount);
            fund(swap(inputToken, fundAmount, address(_weth)));
            emit VrfFunded(fundAmount);
        } else {
            outputAmount = swap(inputToken, inputAmount, outputToken);
        }
    }
}
