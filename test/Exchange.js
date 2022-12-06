const {ethers} = require("hardhat");
const {expect} = require("chai");

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}
describe('Exchange', () => {

    let accounts
    let deployer, user1
    let feeAccount, exchange, token1, token2

    const feePercent = 10

    beforeEach(async () => {
        const Exchange = await ethers.getContractFactory('Exchange')
        const Token = await ethers.getContractFactory('Token')

        accounts = await ethers.getSigners()
        deployer = accounts[0]
        feeAccount = accounts[1]
        user1 = accounts[2]

        token1 = await Token.deploy('Bipin Parmar', 'BIPS')
        token2 = await Token.deploy('Mock Dai', 'mDAI')

        exchange = await Exchange.deploy(feeAccount.address, feePercent)

        let transaction = await token1.connect(deployer).transfer(user1.address, tokens(100))

    })

    describe('Deployment', () => {

        it('tracks the fee account', async () => {
            expect(await exchange.feeAccount()).to.equal(feeAccount.address)
        })

        it('tracks the fee percent', async () => {
            expect(await exchange.feePercent()).to.equal(feePercent)
        })

    })

    describe('Depositing tokens ', () => {

        let transaction, result

        let amount = tokens(10)


        describe('success ', () => {

            beforeEach(async () => {

                // console.log(user1.address, exchange.address, amount.toString())
                // approve token
                transaction = await token1.connect(user1).approve(exchange.address, amount)
                result = await transaction.wait()

                // deposit token
                transaction = await exchange.connect(user1).depositToken(token1.address, amount)
                result = await transaction.wait()


            });


            it('tracks the token deposit', async ()=>{
                expect(await token1.balanceOf(exchange.address)).to.equal(amount)
                expect(await exchange.tokens(token1.address,user1.address)).to.equal(amount)
                expect(await exchange.balanceOf(token1.address,user1.address)).to.equal(amount)
            })

            it('emits a depostite event', async ()=>{

                const event = result.events[1];
                const arg = event.args

                expect(event.event).to.equal('Deposit')

                expect(arg.token).to.equal(token1.address)
                expect(arg.user).to.equal(user1.address)
                expect(arg.amount).to.equal(amount)
                expect(arg.balance).to.equal(amount)
            })
        })

        describe('failure ', () => {

            it('fails if no token approved', async ()=>{
                await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
            });

        })

    })

    describe('Withdraw tokens ', () => {

        let transaction, result

        let amount = tokens(10)


        describe('success ', () => {

            beforeEach(async () => {

                // deposit tokens before withdrawing
                // console.log(user1.address, exchange.address, amount.toString())
                // approve token
                transaction = await token1.connect(user1).approve(exchange.address, amount)
                result = await transaction.wait()

                // deposit token
                transaction = await exchange.connect(user1).depositToken(token1.address, amount)
                result = await transaction.wait()

                // now withdraw tokens
                transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
                result = await transaction.wait()

            });


            it('withdraw token funds', async ()=>{
                expect(await token1.balanceOf(exchange.address)).to.equal(0)
                expect(await exchange.tokens(token1.address,user1.address)).to.equal(0)
                expect(await exchange.balanceOf(token1.address,user1.address)).to.equal(0)
            })

            it('emits a withdraw event', async ()=>{

                const event = result.events[1];
                const arg = event.args

                expect(event.event).to.equal('Withdraw')

                expect(arg.token).to.equal(token1.address)
                expect(arg.user).to.equal(user1.address)
                expect(arg.amount).to.equal(amount)
                expect(arg.balance).to.equal(0)
            })
        })

        describe('failure ', () => {

            it('fails for insufficient balance', async ()=>{
                // attempt to withdraw
                await expect(exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.reverted
            });

        })

    })

    describe('Checking balances ', async () => {

        let transaction, result

        let amount = tokens(1)


        beforeEach(async ()=>{

            // deposit tokens before withdrawing
            // console.log(user1.address, exchange.address, amount.toString())
            // approve token
            transaction = await token1.connect(user1).approve(exchange.address, amount)
            result = await transaction.wait()

            // deposit token
            transaction = await exchange.connect(user1).depositToken(token1.address, amount)
            result = await transaction.wait()

        })

        it('return user balance', async ()=>{
            expect(await exchange.balanceOf(token1.address,user1.address)).to.equal(amount)
        })


    })

    describe('Making Orders ', () => {

        let transaction, result

        let amount = tokens(1)


        describe('success ', () => {

            beforeEach(async () => {

                // deposit tokens before making order
                // console.log(user1.address, exchange.address, amount.toString())
                // approve token
                transaction = await token1.connect(user1).approve(exchange.address, amount)
                result = await transaction.wait()

                // deposit token
                transaction = await exchange.connect(user1).depositToken(token1.address, amount)
                result = await transaction.wait()

                // make order
                transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount)
                result = await transaction.wait()

            });


            it('tracks the newly created orders', async ()=>{
                expect(await exchange.ordersCount()).to.equal(1)
            })

            it('emits a order event', async ()=>{

                const event = result.events[0];
                const arg = event.args

                expect(event.event).to.equal('Order')

                expect(arg.id).to.equal(1)
                expect(arg.user).to.equal(user1.address)
                expect(arg.tokenGet).to.equal(token2.address)
                expect(arg.amountGet).to.equal(amount)
                expect(arg.tokenGive).to.equal(token1.address)
                expect(arg.amountGive).to.equal(amount)
                expect(arg.timestamp).to.at.least(1)
            })
        })

        describe('failure ', () => {

            it('rejects with no balance', async ()=>{
                await expect(exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount)).to.be.reverted;
            })

        })

    })

})