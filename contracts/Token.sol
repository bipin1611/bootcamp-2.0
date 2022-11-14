// SPDX-License-Identifier: GPL
pragma solidity ^0.8.17;

contract Token {

    string public name;

    string public symbol;

    uint public decimals = 18;

    uint public totalSupply = 1000000 * (10**decimals);

    constructor(string memory _name, string memory _symbol){
        name = _name;
        symbol = _symbol;
    }

}
