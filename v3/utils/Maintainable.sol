// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Context.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

abstract contract Maintainable is Context, ConfirmedOwner {
    address private _maintainer;

    event MaintainerReset(
        address indexed previousMaintainer,
        address indexed newMaintainer
    );

    /**
     * @dev Initializes the contract setting the deployer as the initial maintainer.
     */
    constructor() {
        _setMaintainer(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyMaintainer() {
        _checkMaintainer();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function maintainer() public view virtual returns (address) {
        return _maintainer;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkMaintainer() internal view virtual {
        require(
            maintainer() == _msgSender() || owner() == _msgSender(),
            "Maintainable: caller is not the maintainer or the owner"
        );
    }

    /**
     * @dev Sets maintainer of the contract to a new account (`newMaintainer`).
     * Can only be called by the current owner.
     */
    function setMaintainer(address newMaintainer) public virtual onlyOwner {
        _setMaintainer(newMaintainer);
    }

    /**
     * @dev Sets maintainer of the contract to a new account (`newMaintainer`).
     * Internal function without access restriction.
     */
    function _setMaintainer(address newMaintainer) internal virtual {
        address oldMaintainer = _maintainer;
        _maintainer = newMaintainer;
        emit MaintainerReset(oldMaintainer, newMaintainer);
    }
}
