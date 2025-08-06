// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IWETH is IERC20, IERC20Metadata {
    function deposit() external payable;

    function withdraw(uint256 amount) external;
}
