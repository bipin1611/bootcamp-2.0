// SPDX-License-Identifier: GPL
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;

    mapping(address => mapping(address => uint256)) public tokens;

    event Deposit (address token, address user, uint256 amount, uint256 balance);
    event Withdraw (address token, address user, uint256 amount, uint256 balance);

    constructor(address _feeAccount, uint _feePercent){
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // Deposit Tokens
    function depositToken(address _token, uint256 _amount) public{

        // transfer tokens to exchange
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));

        // update user balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;

        // Emit an event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public{
        // ensure user has enough balance
        require(tokens[_token][msg.sender] >= _amount);

        // transfer tokens to user
        require(Token(_token).transfer(msg.sender, _amount));

        // update user balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;


        // Emit Event
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);

    }

    // check balances
    function balanceOf(address _token, address _user) public view returns(uint256){
        return tokens[_token][_user];
    }


}
