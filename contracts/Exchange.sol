// SPDX-License-Identifier: GPL
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;
    uint256 public ordersCount;

    mapping(address => mapping(address => uint256)) public tokens;

    mapping(uint256 => _Order) public orders;

    struct _Order {
        uint256 id; // unique identifier for order
        address user; // user who made order
        address tokenGet; // address of the token they receive
        uint256 amountGet; // amount they receive
        address tokenGive; // address of the token they give
        uint256 amountGive; // amount they give
        uint256 timestamp;
    }

    event Deposit (address token, address user, uint256 amount, uint256 balance);
    event Withdraw (address token, address user, uint256 amount, uint256 balance);
    event Order (uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);

    constructor(address _feeAccount, uint _feePercent){
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // Deposit && withdraw Tokens
    function depositToken(address _token, uint256 _amount) public {

        // transfer tokens to exchange
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));

        // update user balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;

        // Emit an event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
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
    function balanceOf(address _token, address _user) public view returns (uint256){
        return tokens[_token][_user];
    }


    // make & cancel orders

    // token give (the token they want to spend) - which token and how much?
    // token get (the token they want to receive) - which token and how much?
    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {

        // prevent orders if tokens aren't on exchange
        require(balanceOf(_tokenGive, msg.sender) >= _amountGive);

        // create order
        ordersCount = ordersCount + 1;
        orders[ordersCount] = _Order(
            ordersCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );

        emit Order(
            ordersCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }


}
