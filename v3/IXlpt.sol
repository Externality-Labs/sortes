// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @dev Interface of the Xbit lp token contract.
 */
interface IXlpt is IERC20 {
    event Minted(address account, uint256 amount);

    event Burned(address account, uint256 amount);

    function token2LpAmount(
        uint256 tokenAmount
    ) external view returns (uint256 lpAmount);

    function lp2TokenAmount(
        uint256 lpAmount
    ) external view returns (uint256 tokenAmount);

    /**
     * @dev Mint lp token to the account [onlyCore].
     * @param account address of the account.
     * @param amount amount of the lp token minted.
     * EMIT Minted event.
     */
    function mint(address account, uint256 amount) external;

    /**
     * @dev Burn the specified amount of lp token from the account [onlyCore].
     * @param account address of the account.
     * @param amount amount of the lp token burned.
     * EMIT Burned event.
     */
    function burn(address account, uint256 amount) external;
}
