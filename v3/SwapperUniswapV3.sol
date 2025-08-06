// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Swapper.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

abstract contract SwapperUniswapV3 is Swapper {
    // Uniswap variables
    ISwapRouter internal immutable _swapRouter;

    constructor(address _addr_uniswap_swaprouter) {
        _swapRouter = ISwapRouter(_addr_uniswap_swaprouter);
    }

    /**
     * @dev Swap tokens, only if the swap pair exists.
     * @param inputToken address of the input token.
     * @param inputAmount amount of the input token.
     * @param outputToken address of the output token.
     * @return outputAmount amount of the output token.
     * EMIT TokenSwapped event.
     */
    function swap(
        address inputToken,
        uint256 inputAmount,
        address outputToken
    ) internal override returns (uint256 outputAmount) {
        // require(
        //     IERC20(inputToken).balanceOf(address(this)) >= inputAmount,
        //     "Swapper: insufficient balance"
        // );
        // require(inputAmount > 0, "Swapper: inputAmount must > 0");
        // require(
        //     _paths[inputToken][outputToken].length > 0,
        //     "Swapper: swap path not found"
        // );

        if (inputToken == outputToken) {
            // No need to swap
            outputAmount = inputAmount;
        } else {
            TransferHelper.safeApprove(
                address(inputToken),
                address(_swapRouter),
                inputAmount
            );

            ISwapRouter.ExactInputParams memory params = ISwapRouter
                .ExactInputParams({
                    path: _paths[inputToken][outputToken],
                    recipient: address(this),
                    deadline: block.timestamp,
                    amountIn: inputAmount,
                    amountOutMinimum: 0
                });

            // Executes the swap
            outputAmount = _swapRouter.exactInput(params);
        }

        emit TokenSwapped(inputToken, inputAmount, outputToken, outputAmount);
    }
}
