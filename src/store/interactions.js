import {ethers} from "ethers";
import config from "../config.json";
import TOKEN_ABI from "../abis/Token.json";

export const loadProvider = (dispatch) => {
    const connection = new ethers.providers.Web3Provider(window.ethereum)

    dispatch({type: 'PROVIDER_LOADED', connection})

    return connection
}

export const loadNetwork = async (provider, dispatch) => {
    const { chainId } = await provider.getNetwork()

    dispatch({ type: 'NETWORK_LOADED', chainId })

    return chainId
}

export const loadAccount = async (dispatch) => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts'})
    const account = ethers.utils.getAddress((accounts[0]))

    dispatch({ type: 'ACCOUNT_LOADED', account })

    return account
}

export const loadToken = async (provider, chainId, dispatch) => {
    const token = new ethers.Contract(config[chainId].dApp.address, TOKEN_ABI, provider)
    console.log(token.address)

    const symbol = await token.symbol();
    console.log(symbol)

    dispatch({ type: 'TOKEN_LOADED', token,  symbol})

    return symbol
}
