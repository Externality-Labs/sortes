// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Maintainable.sol";

contract Cored is Maintainable {
    address private CORE_ADDRESS = address(0x0);

    event CoreAddressSet(address coreAddress);

    constructor() ConfirmedOwner(msg.sender) {}

    /**
     * @dev Set the address of the Core contract.
     * @param coreAddress address of the Core contract.
     * EMIT CoreAddressSet event.
     */
    function setCoreAddress(address coreAddress) public onlyOwner {
        CORE_ADDRESS = coreAddress;
        emit CoreAddressSet(coreAddress);
    }

    /**
     * @dev Get the address of the Core contract.
     */
    function core() public view returns (address) {
        return CORE_ADDRESS;
    }

    /**
     * @dev Throws if called by any account other than the core.
     */
    modifier onlyCore() {
        _checkCore();
        _;
    }

    /**
     * @dev Throws if the sender is not the core.
     */
    function _checkCore() internal view virtual {
        require(core() == _msgSender(), "Cored: caller is not the core");
    }
}
