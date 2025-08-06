// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract Good is ERC20, ERC20Burnable {
    constructor(
        address[] memory addresses,
        uint256[] memory amounts
    ) ERC20("Good", "GOOD") {
        require(
            addresses.length == amounts.length,
            "Good: addresses and amounts length mismatch"
        );

        for (uint256 i = 0; i < addresses.length; i++) {
            _mint(addresses[i], amounts[i]);
        }
    }
}
