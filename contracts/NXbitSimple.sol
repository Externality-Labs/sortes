// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./NXbit.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

contract NXbitSimple is NXbit {
    uint256 public nextRequestId = 0;

    // Uniswap variables
    uint256 dummyFund = 0;
    IUniswapV2Router02 private immutable v2Router02;

    // === Basic functions ===
    constructor(
        TokenAddress memory addresses,
        address _addr_uniswapV2Router02
    )
        NXbit(addresses, address(this), address(this))
        ConfirmedOwner(msg.sender)
    {
        v2Router02 = IUniswapV2Router02(_addr_uniswapV2Router02);
    }

    function convertUSDT2JKPT(
        uint amountIn
    ) internal override returns (uint amountOut) {
        // Approve the router to spend usdt.
        TransferHelper.safeApprove(
            address(_usdt),
            address(v2Router02),
            amountIn
        );

        // amountOutMin must be retrieved from an oracle of some kind
        uint[] memory amountOuts = v2Router02.swapExactTokensForTokens(
            amountIn,
            (estimateUSDT2JKPT(amountIn) * 3) / 4, // amountMin
            getPathForUSDT2JKPT(),
            address(this),
            block.timestamp + 60000 // roughly 1min
        );

        return amountOuts[amountOuts.length - 1];
    }

    function convertUSDC2JKPT(
        uint amountIn
    ) internal override returns (uint amountOut) {
        // Approve the router to spend usdc.
        TransferHelper.safeApprove(
            address(_usdc),
            address(v2Router02),
            amountIn
        );

        // amountOutMin must be retrieved from an oracle of some kind
        uint[] memory amountOuts = v2Router02.swapExactTokensForTokens(
            amountIn,
            (estimateUSDC2JKPT(amountIn) * 3) / 4, // amountMin
            getPathForUSDC2JKPT(),
            address(this),
            block.timestamp + 60000 // roughly 1min
        );

        return amountOuts[amountOuts.length - 1];
    }

    function estimateUSD2JKPT(
        uint amountIn
    ) public view override returns (uint) {
        return estimateUSDT2JKPT(amountIn);
    }

    function estimateUSDT2JKPT(uint amountIn) public view returns (uint) {
        uint[] memory amountOuts = v2Router02.getAmountsOut(
            amountIn,
            getPathForUSDT2JKPT()
        );
        return amountOuts[amountOuts.length - 1];
    }

    function estimateUSDC2JKPT(uint amountIn) public view returns (uint) {
        uint[] memory amountOuts = v2Router02.getAmountsOut(
            amountIn,
            getPathForUSDC2JKPT()
        );
        return amountOuts[amountOuts.length - 1];
    }

    function getPathForUSDT2JKPT() internal view returns (address[] memory) {
        address[] memory path = new address[](2);
        path[0] = address(_usdt);
        path[1] = address(_jkpt);

        return path;
    }

    function getPathForUSDC2JKPT() internal view returns (address[] memory) {
        address[] memory path = new address[](2);
        path[0] = address(_usdc);
        path[1] = address(_jkpt);

        return path;
    }

    function unsafeDice() public view returns (uint256) {
        // TESTNET ONLY: use unsafe onchain method
        return
            uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender)));
    }

    // === Reward functions ===
    function simpleFulfillRandomness(uint256 requestId) internal override {
        afterRandom(requestId, unsafeDice());
    }

    function fundSubscription(
        uint256 usd_amount,
        uint8 usdType
    ) internal override returns (uint256) {
        dummyFund += usd_amount;
        return usdType * 0;
    }

    function requestRandomWords() internal override returns (uint256) {
        return nextRequestId++;
    }
}
