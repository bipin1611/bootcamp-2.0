import {ethers} from "ethers";
import config from "../config.json";
import TOKEN_ABI from "../abis/Token.json";
import EXCHANGE_ABI from "../abis/Exchange.json";

export const loadProvider = (dispatch) => {
    const connection = new ethers.providers.Web3Provider(window.ethereum)

    dispatch({type: 'PROVIDER_LOADED', connection})

    return connection
}

export const loadNetwork = async (provider, dispatch) => {
    const {chainId} = await provider.getNetwork()

    dispatch({type: 'NETWORK_LOADED', chainId})

    return chainId
}

export const loadAccount = async (provider, dispatch) => {
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
    const account = ethers.utils.getAddress((accounts[0]))

    dispatch({type: 'ACCOUNT_LOADED', account})

    let balance = await provider.getBalance(account)
    balance = ethers.utils.formatEther(balance)

    dispatch({type: 'ETHER_BALANCE_LOADED', balance})

    return account
}

export const loadTokens = async (provider, addresses, dispatch) => {
    let token, symbol
    token = new ethers.Contract(addresses[0], TOKEN_ABI, provider)
    symbol = await token.symbol();
    dispatch({type: 'TOKEN_1_LOADED', token, symbol})

    token = new ethers.Contract(addresses[1], TOKEN_ABI, provider)
    symbol = await token.symbol();
    dispatch({type: 'TOKEN_2_LOADED', token, symbol})

    return symbol
}


export const loadExchange = async (provider, address, dispatch) => {
    let exchange
    exchange = new ethers.Contract(address, EXCHANGE_ABI, provider)
    dispatch({type: 'EXCHANGE_LOADED', exchange})

    return exchange
}

// Load user balances
export const loadBalances = async (exchange, tokens, account, dispatch) => {

    let balance = await tokens[0].balanceOf(account)
    balance = ethers.utils.formatEther(balance)
    dispatch({type: "TOKEN_1_BALANCE_LOADED", balance})

    balance = await exchange.balanceOf(tokens[0].address, account)
    balance = ethers.utils.formatEther(balance)
    dispatch({type: "EXCHANGE_TOKEN_1_BALANCE_LOADED", balance})

    balance = await tokens[1].balanceOf(account)
    balance = ethers.utils.formatEther(balance)
    dispatch({type: "TOKEN_2_BALANCE_LOADED", balance})

    balance = await exchange.balanceOf(tokens[1].address, account)
    balance = ethers.utils.formatEther(balance)
    dispatch({type: "EXCHANGE_TOKEN_2_BALANCE_LOADED", balance})

}


//// Transfer tokens (deposit & withdraw)
export const transferTokens = async (provider, exchange, transferType, token, amount, dispatch) => {

    let transaction

    dispatch({type: "TRANSFER_REQUEST"})

    try{


        const signer = await provider.getSigner()
        const amountToTransfer = ethers.utils.parseEther(amount.toString(), 18)

        if(transferType == 'Deposit'){

            transaction = await token.connect(signer).approve(exchange.address, amountToTransfer)
            await transaction.wait()

            // deposit token
            transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer)
            await transaction.wait()

        }else{
            transaction = await exchange.connect(signer).withdrawToken(token.address, amountToTransfer)
            await transaction.wait()
        }

    }catch (error){
        dispatch({type: "TRANSFER_FAIL"})
    }



}


export const subscriberToEvents = (exchange, dispatch) => {

    exchange.on('Deposit', (token, user, amount, balance, event) => {
        dispatch({type: "TRANSFER_SUCCESS", event})
    })
    exchange.on('Withdraw', (token, user, amount, balance, event) => {
        dispatch({type: "TRANSFER_SUCCESS", event})
    })
}