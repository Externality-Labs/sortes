// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./utils/Maintainable.sol";

abstract contract Randomizer is Maintainable {
    /**
     * @dev Request randomness from a source.
     * @return requestId id of the request.
     * EMIT RandomnessRequested event.
     */
    function requestRandomness() internal virtual returns (uint256 requestId);

    event RandomnessRequested(uint256 requestId);

    /**
     * @dev Fulfill the randomness.
     * EMIT RandomnessFulfilled event.
     */
    function fulfillRandomness(
        uint256 requestId,
        uint256 randomness
    ) internal virtual;

    event RandomnessFulfilled(uint256 requestId, uint256 randomness);

    function belowThreshold() internal view virtual returns (bool);

    function fund(uint256 amount) internal virtual;
}
