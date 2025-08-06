// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./IXlpt.sol";
import "./utils/Cored.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Xlpt is IXlpt, Cored, ERC20 {
    ERC20 _originalToken;

    constructor(
        address token,
        address core
    ) ERC20(lpName(token), lpSymbol(token)) {
        _originalToken = ERC20(token);
        setCoreAddress(core);
    }

    function decimals() public view virtual override returns (uint8) {
        return _originalToken.decimals();
    }

    function lpName(address token) private view returns (string memory) {
        return string(abi.encodePacked("LP ", ERC20(token).name()));
    }

    function lpSymbol(address token) private view returns (string memory) {
        return string(abi.encodePacked("X-", ERC20(token).symbol()));
    }

    function token2LpAmount(
        uint256 tokenAmount
    ) external view override returns (uint256 lpAmount) {
        require(tokenAmount > 0, "Xlpt: tokenAmount is zero");
        uint256 totalOrigin = IERC20(_originalToken).balanceOf(core());
        uint256 totalLpt = this.totalSupply();

        // calculate lpt amount
        if (totalOrigin == 0 || totalLpt == 0) {
            lpAmount = tokenAmount;
        } else {
            lpAmount = (tokenAmount * totalLpt) / totalOrigin;
        }
    }

    function lp2TokenAmount(
        uint256 lpAmount
    ) external view override returns (uint256 tokenAmount) {
        require(lpAmount > 0, "Xlpt: lpAmount is zero");
        uint256 totalOrigin = IERC20(_originalToken).balanceOf(core());
        uint256 totalLpt = this.totalSupply();

        if (totalOrigin == 0 || totalLpt == 0) {
            tokenAmount = 0;
        } else {
            tokenAmount = (lpAmount * totalOrigin) / totalLpt;
        }
    }

    function mint(address account, uint256 amount) external override onlyCore {
        _mint(account, amount);
        emit Minted(account, amount);
    }

    function burn(address account, uint256 amount) external override onlyCore {
        _burn(account, amount);
        emit Burned(account, amount);
    }
}
