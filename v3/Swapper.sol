// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./utils/Maintainable.sol";

abstract contract Swapper is Maintainable {
    address[] internal _inputTokens;
    address[] internal _outputTokens;
    address[] internal _validInputTokens;
    address[] internal _validOutputTokens;
    mapping(address => mapping(address => bytes)) internal _paths;
    mapping(address => address) internal _outputToken2lp;
    mapping(address => uint256) internal _inputToken2lowerBound;

    event InputTokenAdded(address token, uint256 lowerBound);

    event OutputTokenAdded(address token, address lp);

    event TokenSwapped(
        address inputToken,
        uint256 inputAmount,
        address outputToken,
        uint256 outputAmount
    );

    /**
     * @dev Add a valid input token and set its lower bound.
     * @param token address of the original token
     * @param lowerBound lower bound of the token
     */
    function addValidInputToken(
        address token,
        uint256 lowerBound
    ) external onlyMaintainer {
        if (!isValidInputToken(token)) {
            _validInputTokens.push(token);
        }
        _inputToken2lowerBound[token] = lowerBound;

        emit InputTokenAdded(token, lowerBound);
    }

    /**
     * @dev Add a valid output token and set its LP token.
     * @param token address of the original token
     * @param lp address of the LP token
     */
    function addValidOutputToken(
        address token,
        address lp
    ) external onlyMaintainer {
        if (!isValidOutputToken(token)) {
            _validOutputTokens.push(token);
        }
        _outputToken2lp[token] = lp;

        emit OutputTokenAdded(token, lp);
    }

    function getLp(address token) public view returns (address lp) {
        require(
            _outputToken2lp[token] != address(0),
            "Swapper: invalid output token"
        );
        return _outputToken2lp[token];
    }

    function getLowerBound(address token) public view returns (uint256) {
        return _inputToken2lowerBound[token];
    }

    function isValidInputToken(address token) public view returns (bool valid) {
        for (uint256 i = 0; i < _validInputTokens.length; i++) {
            if (token == _validInputTokens[i]) {
                return true;
            }
        }
        return false;
    }

    function isValidOutputToken(
        address token
    ) public view returns (bool valid) {
        for (uint256 i = 0; i < _validOutputTokens.length; i++) {
            if (token == _validOutputTokens[i]) {
                return true;
            }
        }
        return false;
    }

    function listValidTokens()
        public
        view
        returns (address[] memory inputTokens, address[] memory outputTokens)
    {
        inputTokens = _validInputTokens;
        outputTokens = _validOutputTokens;
    }

    // /**
    //  * @dev Get a swap pair by input token and output token.
    //  */
    // function getSwapPath(
    //     address inputToken,
    //     address outputToken
    // ) public view returns (bytes memory swapPath) {
    //     swapPath = _paths[inputToken][outputToken];
    // }

    /**
     * @dev List all swap pairs.
     * @return inputTokens a list of input tokens
     * @return outputTokens a list of output tokens
     */
    function listSwapPairs()
        public
        view
        returns (address[] memory inputTokens, address[] memory outputTokens)
    {
        inputTokens = _inputTokens;
        outputTokens = _outputTokens;
    }

    /**
     * @dev add the swap path of a pair.
     * @param tokens address of the tokens in the path
     * @param fees fees of each hop in the path
     */
    function addSwapPair(
        address[] calldata tokens,
        uint256[] calldata fees
    ) external onlyMaintainer {
        require(isValidInputToken(tokens[0]), "Swapper: input token invalid");
        require(
            isValidOutputToken(tokens[tokens.length - 1]),
            "Swapper: output token invalid"
        );
        bytes memory path = abi.encodePacked(tokens[0]);
        for (uint256 i = 1; i < tokens.length; i++) {
            path = abi.encodePacked(path, uint24(fees[i - 1]), tokens[i]);
        }
        _inputTokens.push(tokens[0]);
        _outputTokens.push(tokens[tokens.length - 1]);
        _paths[tokens[0]][tokens[tokens.length - 1]] = path;
    }

    /**
     * @dev remove the swap pair with path.
     * @param inputToken address of the input token
     * @param outputToken address of the output token
     */
    function removeSwapPair(
        address inputToken,
        address outputToken
    ) external onlyMaintainer {
        for (uint256 i = 0; i < _inputTokens.length; i++) {
            if (
                _inputTokens[i] == inputToken && _outputTokens[i] == outputToken
            ) {
                _inputTokens[i] = _inputTokens[_inputTokens.length - 1];
                _inputTokens.pop();
                _outputTokens[i] = _outputTokens[_outputTokens.length - 1];
                _outputTokens.pop();
                delete _paths[inputToken][outputToken];
                break;
            }
        }
    }

    function swap(
        address inputToken,
        uint256 inputAmount,
        address outputToken
    ) internal virtual returns (uint256 outputAmount);
}
