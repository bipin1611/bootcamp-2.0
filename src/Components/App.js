import { useEffect } from "react";
import {useDispatch} from "react-redux";
import {loadProvider, loadNetwork, loadAccount, loadTokens, loadExchange} from "../store/interactions";
import config from "../config.json";
import Navbar from "./Navbar";

function App() {
    const dispatch = useDispatch()

    const loadBlockchainData = async () =>{

        // connect ethers to blockchain
        const provider = loadProvider(dispatch)
        const chainId = await loadNetwork(provider, dispatch)

        // reload page when network changes
        window.ethereum.on('chainChanged', () =>{
            // console.log('changed')
            window.location.reload()
        })

        // fetch current network's chainId (e.g hardhat: 31337, kovan: 42) & when account changed
        window.ethereum.on('accountsChanged', ()=>{
            loadAccount(provider, dispatch)
        })
        // await loadAccount(provider, dispatch)

        // token smart Contract
        const  dApp = config[chainId].dApp.address
        const  mETH = config[chainId].mETH.address
        await loadTokens(provider, [dApp,mETH], dispatch)

        const  exchange = config[chainId].exchange.address
        await loadExchange(provider, exchange, dispatch)
    }

    useEffect(()=>{
        loadBlockchainData()
    })

    return (
        <div>

            <Navbar />

            <main className='exchange grid'>
                <section className='exchange__section--left grid'>

                    {/* Markets */}

                    {/* Balance */}

                    {/* Order */}

                </section>
                <section className='exchange__section--right grid'>

                    {/* PriceChart */}

                    {/* Transactions */}

                    {/* Trades */}

                    {/* OrderBook */}

                </section>
            </main>

            {/* Alert */}

        </div>
    );
}

export default App;
