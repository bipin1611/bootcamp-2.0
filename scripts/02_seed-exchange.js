// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const {ethers} = require("hardhat");
const config = require('../src/config.json')

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

const wait = (seconds) => {
    const milliseconds = seconds * 1000

    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {


    const accounts = await hre.ethers.getSigners()
    const { chainId } = await hre.ethers.provider.getNetwork()
    console.log("Using chainId", chainId)

    // deployed token
    const dApp = await hre.ethers.getContractAt('Token', config[chainId].dApp.address);
    console.log(`dapp Token fetched: ${dApp.address}\n`);

    const mDai = await hre.ethers.getContractAt('Token', config[chainId].mDai.address);
    console.log(`mDai Token fetched: ${mDai.address}\n`);

    const mETH = await hre.ethers.getContractAt('Token', config[chainId].mETH.address);
    console.log(`mETH Token fetched: ${mETH.address}\n`);

    const exchange = await hre.ethers.getContractAt('Exchange', config[chainId].exchange.address);
    console.log(`exchange fetched: ${exchange.address}\n`);

    // set user
    const sender = accounts[0]
    const receiver = accounts[1]
    let amount = tokens(10000)

    // user1 transfers 1000 mETH
    let transaction, result
    await mETH.connect(sender).transfer(receiver.address, amount)
    console.log(`Transferred ${amount} token fro ${sender.address} to ${receiver.address}\n`);


    // set up exchanged users
    const user1 = accounts[0]
    const user2 = accounts[1]
    amount = tokens(10000);

    // Distribute tokens && deposit tokens to exchange

    // user1 approved 1000 dApp
    // approve token
    transaction = await dApp.connect(user1).approve(exchange.address, amount)
    await transaction.wait()
    console.log(`Approved ${amount} tokens from ${user1.address}\n`);

    // deposit token
    transaction = await exchange.connect(user1).depositToken(dApp.address, amount)
    await transaction.wait()
    console.log(`Deposit ${amount} Ether from ${user1.address}\n`);

    // user2 approved 1000 mETH
    // approve token
    transaction = await mETH.connect(user2).approve(exchange.address, amount)
    await transaction.wait()
    console.log(`Approved ${amount} mETH tokens from ${user2.address}\n`);

    // deposit token
    transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
    await transaction.wait()
    console.log(`Deposit ${amount} mETH from ${user2.address}\n`);


    /////////////////////////////////////////////////////////////////////
    // seed a cancelled order

    // user1 makes order to get tokens No1
    let orderId
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), dApp.address, tokens(5))
    result = await transaction.wait()
    console.log(`Made order form ${user1.address}\n`);

    // user1 cancel order to get tokens No1
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user1).cancelOrder(orderId)
    await transaction.wait()
    console.log(`Cancelled order form ${user1.address}\n`);

    await wait(1)


    /////////////////////////////////////////////////////////////////////
    // seed a filled order

    // user1 makes order No1
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), dApp.address, tokens(10))
    result = await transaction.wait()
    console.log(`Made order form ${user1.address}\n`);

    // user2 fill order to get tokens No1
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order form ${user2.address}\n`);

    await wait(1)


    // user1 makes order an another order No2
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(500), dApp.address, tokens(15))
    result = await transaction.wait()
    console.log(`Made order form ${user1.address}\n`);


    // user2 fill order an another order No2
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order form ${user2.address}\n`);

    await wait(1)


    // user1 makes order final order No3
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), dApp.address, tokens(20))
    result = await transaction.wait()
    console.log(`Made order form ${user1.address}\n`);


    // user2 fill order final order No3
    orderId = result.events[0].args.id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order form ${user2.address}\n`);

    await wait(1)


    //////////////////////////////////////////////////////////////////////
    // Seed open orders

    // user1 10 makes orders
    for (let i = 1; i <= 5; i++) {
        transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i), dApp.address, tokens(10))
        result = await transaction.wait()
        console.log(`Made order form ${user1.address}`);

        await wait(1)

    }

    // user2 10 makes orders
    for (let i = 1; i <= 5; i++) {
        transaction = await exchange.connect(user2).makeOrder(mETH.address, tokens(10), dApp.address, tokens(10 * i))
        result = await transaction.wait()
        console.log(`Made order form ${user2.address}`);

        await wait(1)

    }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
