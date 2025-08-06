// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../IXlpt.sol";
import "../utils/Cored.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract Xexp is Cored, ERC20, ERC20Burnable {
    event Minted(address account, uint256 amount);
    event Burned(address account, uint256 amount);

    constructor() ERC20("Xexp", "XEXP") {}

    function mint(address account, uint256 amount) external onlyCore {
        _mint(account, amount);
        emit Minted(account, amount);
    }

    function burn(address account, uint256 amount) external onlyCore {
        _burn(account, amount);
        emit Burned(account, amount);
    }
}
