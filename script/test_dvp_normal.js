const hre = require("hardhat");
const {ethers} = hre;
const p = require('poseidon-lite');
const crypto = require("crypto");
const assert = require('assert');
const {Wallet} = require("ethers");
const chai = require("chai");
const expect = chai.expect;
const hardhatConfig = require('../hardhat.config');


//token contract address
const drex = "0xa918ac1c8860C3b35A5dFFd9bdFA3994e383c820";
const dvtA = "0xa918ac1c8860C3b35A5dFFd9bdFA3994e383c820";
const dvtB = "0xa918ac1c8860C3b35A5dFFd9bdFA3994e383c820";

const drexEscrotingAddress = "0x993120Ffa250CF1879880D440cff0176752c17C2";
const dvtAEscortingAddress = "0x993120Ffa250CF1879880D440cff0176752c17C2";
const dvtBEscortingAddress = "0x993120Ffa250CF1879880D440cff0176752c17C2";

const bankA = hardhatConfig.networks.server_L2_1.accounts[1];
const bankB = hardhatConfig.networks.server_L2_1.accounts[2];
const client1 = hardhatConfig.networks.server_L2_1.accounts[3];
const client2 = hardhatConfig.networks.server_L2_1.accounts[4];
const client3 = hardhatConfig.networks.server_L2_1.accounts[5];
const adminPrivateKey = hardhatConfig.networks.server_L2_1.accounts[0];
const l1AdminPrivateKey = hardhatConfig.networks.server_L2_1.accounts[6];

//node rpc url
//node rpc url
const L1Url = hardhatConfig.networks.server_L1_besu.url;
const centralBankRpcUrl = hardhatConfig.networks.server_L2_1.url;
const bankARpcUrl = hardhatConfig.networks.server_L2_2.url;
const bankBRpcUrl = hardhatConfig.networks.server_L2_3.url;
console.log("L1.url:", L1Url)
console.log("server_L2_1.url:", centralBankRpcUrl)
console.log("server_L2_2.url:", bankARpcUrl)
console.log("server_L2_3.url:", bankBRpcUrl)
// const bankARpcUrl = hardhatConfig.networks.serverL2_2.url;
// const bankBRpcUrl = hardhatConfig.networks.serverL2_3.url;

const customNetwork = {
    name: "HAMSA",
    chainId: 1001
};
const l1CustomNetwork = {
    name: "besu",
    chainId: 1337
};
const options = {
    batchMaxCount: 1,
    staticNetwork: true
};


// provider
const centralBankProvider = new ethers.JsonRpcProvider(centralBankRpcUrl, customNetwork, options);
const bankAProvider = new ethers.JsonRpcProvider(bankARpcUrl, customNetwork, options);
const bankBProvider = new ethers.JsonRpcProvider(bankBRpcUrl, customNetwork, options);
const L1Provider = new ethers.JsonRpcProvider(L1Url,l1CustomNetwork,options);

const userAWallet = new ethers.Wallet(client1, bankAProvider);
const userBWallet = new ethers.Wallet(client2, bankBProvider);
const userCWallet = new ethers.Wallet(client3, bankAProvider);
const adminWallet = new ethers.Wallet(adminPrivateKey, centralBankProvider);
const l1AdminWallet = new ethers.Wallet(l1AdminPrivateKey, L1Provider);

const bankAWalletOfDvtA = new ethers.Wallet(bankA, bankAProvider);
const bankAWalletOfDvtB = new ethers.Wallet(bankA, bankBProvider);
const bankBWalletOfDvtA = new ethers.Wallet(bankB, bankAProvider);
const bankBWalletOfDvtB = new ethers.Wallet(bankB, bankBProvider);
const bankAWalletOfCBDC = new ethers.Wallet(bankA, centralBankProvider);
const bankBWalletOfCBDC = new ethers.Wallet(bankB, centralBankProvider);

let SimpleFactory, DvpEscrowFactory;
let scheduleRequest

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function mintToken(provider, tokenAddress, userWallet, amount) {
    SimpleFactory = await ethers.getContractFactory("Simple")
    let Simple = await SimpleFactory.attach(tokenAddress).connect(userWallet);
    const tx = await Simple.mint(userWallet.address, amount);
    await tx.wait();
}

async function getTokenBalance(provider, tokenAddress, account) {
    SimpleFactory = await ethers.getContractFactory("Simple")
    let Simple = await SimpleFactory.attach(tokenAddress).connect(provider);
    let balance = await Simple.balanceOf(account);
    return balance;
}

async function getCDBCBalance() {
    const bankABalance = await getTokenBalance(centralBankProvider, drex, bankAWalletOfCBDC.address);
    const bankBBalance = await getTokenBalance(centralBankProvider, drex, bankBWalletOfCBDC.address);
    console.log("bankA centralBank balance is ", bankABalance);
    console.log("bankB centralBank balance is ", bankBBalance);
    // return {bankABalance,bankBBalance}

}

async function getBundleTransaction(bundleHash, bankProvider) {
    let BundleTransaction = await bankProvider.send("eth_checkTransactionBundle", [bundleHash]);
    console.log("BundleTransaction", BundleTransaction);
}

async function checkBundleTransaction(bundleHash, bankProvider) {
    let BundleTransaction = await bankProvider.send("eth_checkTransactionBundle", [bundleHash]);
    // console.log("BundleTransaction", BundleTransaction);
    let status = BundleTransaction.Status;
    while (status !== 2) {
        // console.log("bundle status is not 2, continue fetch status, current status is : ", status);
        await sleep(2000);
        BundleTransaction = await bankProvider.send("eth_checkTransactionBundle", [bundleHash]);
        console.log("BundleTransaction", BundleTransaction);
        status = BundleTransaction.Status;
    }
}
async function checkTransactionStatus(bundleHash,wallet,escortingAddress){
    const DvpEscrow = await ethers.getContractFactory("DvpEscrow");
    const dvpEscrow = await DvpEscrow.attach(escortingAddress).connect(wallet);
    let slot  = await dvpEscrow.Transactions(bundleHash)

    console.log("slot: ", slot)
}
async function transferEth(provider, privateKey, fromAddress, toAddress, amount) {
    const wallet = new ethers.Wallet(privateKey, provider);
    if (wallet.address.toLowerCase() !== fromAddress.toLowerCase()) {
        throw new Error('Wallet address does not match the provided fromAddress.');
    }

    const amountInWei = ethers.parseEther(amount.toString());
    const transaction = {
        to: toAddress,
        value: amountInWei,
    };
    try {
        const response = await wallet.sendTransaction(transaction);
        console.log(`Transaction hash: ${response.hash}`);
        return response;
    } catch (error) {
        console.error('Error sending transaction:', error);
        throw error;
    }
}

async function checkTokenBalance(provider, tokenAddress, accountWallet, amount) {
    let balance = await getTokenBalance(provider, tokenAddress, accountWallet.address)
    if (balance >= amount) {
        console.log("user token balance is enough for the transaction")
    } else {
        await mintToken(provider, tokenAddress, accountWallet, amount)
        console.log("after minted, user token balance is ", await getTokenBalance(provider, tokenAddress, accountWallet.address))
    }
}

describe("Test Eth", function () {
    this.timeout(120000)
    it('check account eth', async () => {
        console.log("userB eth is ", await bankBProvider.getBalance(userAWallet.address))
        console.log("userA eth is ", await bankBProvider.getBalance(userBWallet.address))
    });
    it.skip('send eth to account on node2', async () => {
        let toAddress = client1Address
        console.log("account eth before ", await bankAProvider.getBalance(toAddress))
        let sendPrivate = client1PrivateKey;
        let senderAddress = client1Address;
        let amount = 1;
        let tx = await transferEth(bankAProvider, sendPrivate, senderAddress, toAddress, amount)
        await tx.wait();
        console.log("account eth after ", await bankAProvider.getBalance(toAddress))
    });
    it.skip('send eth to account on node3', async () => {
        let toAddress = "0x173e9c0FCad1c3628Bb177299053a71BF5ec1E66"
        console.log("account eth before ", await bankBProvider.getBalance(toAddress))
        let sendPrivate = client1PrivateKey;
        let senderAddress = client1Address;
        let amount = 1;
        let tx = await transferEth(bankBProvider, sendPrivate, senderAddress, toAddress, amount)
        await tx.wait();
        console.log("account eth after ", await bankBProvider.getBalance(toAddress))
    });
    it.skip('send eth to account on node1', async () => {
        let toAddress = "0x173e9c0FCad1c3628Bb177299053a71BF5ec1E66"
        console.log("account eth before ", await centralBankProvider.getBalance(toAddress))
        let sendPrivate = client1PrivateKey;
        let senderAddress = client1Address;
        let amount = 1;
        let tx = await transferEth(centralBankProvider, sendPrivate, senderAddress, toAddress, amount)
        await tx.wait();
        console.log("account eth after ", await centralBankProvider.getBalance(toAddress))
    });

})

describe("Test Check BundleHash", function () {
    // it("node2", async () => {
    //     // let bundleHash = '0x24878e048b4cb7a70cfc0271ea9004e4f832d781eb095d7d5c64474339c5c9d2';
    //     let bundleHash = '0x43c1c8c9d42e9593e79eb00099543c05783cca5e9617611f68a0916191778c5d';
    //     // let bundleHash = '0x16e06156a60017743124872ac04eb7f33f3d8c02e0d65b94e88ca978bd058556';
    //     // let BundleTransaction = await bankAProvider.send("eth_checkTransactionBundle", [bundleHash]);
    //     let BundleTransaction = await bankAProvider.send("eth_getTransactionByHash", [bundleHash,false]);
    //     console.log("BundleTransaction", BundleTransaction);
    // })
    it("node2", async () => {
        let bundleHash = '0x24878e048b4cb7a70cfc0271ea9004e4f832d781eb095d7d5c64474339c5c9d2';
        // let bundleHash = '0x16e06156a60017743124872ac04eb7f33f3d8c02e0d65b94e88ca978bd058556';
        let slot = await checkTransactionStatus(bundleHash,userAWallet,dvtAEscortingAddress)
        console.log("slot is ", slot);
    })
})

describe('Test check token balance', function () {
    this.timeout(120000);
    before(async function () {
        SimpleFactory = await ethers.getContractFactory("Simple");
    })
    it("check account token balance on bankA", async () => {
        console.log("userA account token balance on bankA is ", await getTokenBalance(bankAProvider, dvtA, userAWallet.address));
        console.log("bankB account token balance on bankA is ", await getTokenBalance(bankAProvider, dvtA, bankBWalletOfDvtA.address));
    })
    it("check account token balance on bankB", async () => {
        console.log("userB account token balance on bankB is ", await getTokenBalance(bankBProvider, dvtB, userBWallet.address));
        console.log("bankA account token balance on bankB is ", await getTokenBalance(bankBProvider, dvtB, bankBWalletOfDvtB.address));
    })
    it("check account token balance on centralBank", async () => {
        console.log("bankA account token balance on centralBank is ", await getTokenBalance(centralBankProvider, drex, bankAWalletOfCBDC.address));
        console.log("bankB account token balance on centralBank is ", await getTokenBalance(centralBankProvider, drex, bankBWalletOfCBDC.address));
    })
})

describe('Test mint token on L2 node', function () {
    this.timeout(120000);
    before(async function () {
        SimpleFactory = await ethers.getContractFactory("Simple");
    })
    it("mint tokens to user and bank accounts on bankA node", async () => {
        const amount = 20000;
        console.log("------------ start to mint dvtA to userA ------------")
        let tokenBefore = await getTokenBalance(bankAProvider, dvtA, userAWallet.address);
        console.log("userA token balance before mint is : ", tokenBefore);
        await mintToken(bankAProvider, dvtA, userAWallet, amount);
        let tokenAfter = await getTokenBalance(bankAProvider, dvtA, userAWallet.address);
        console.log("user dvtA token balance after mint is : ", tokenAfter);
        let increase = parseInt(tokenAfter.toString()) - parseInt(tokenBefore.toString());
        assert.strictEqual(increase, amount, 'Mint operation failed. Token balance increase is not as expected.');
        console.log("------------ start to mint dvtA to bankA ------------")
        tokenBefore = await getTokenBalance(bankAProvider, dvtA, bankAWalletOfDvtA.address);
        console.log("bankA dvtA token balance before mint is : ", tokenBefore);
        await mintToken(bankAProvider, dvtA, bankAWalletOfDvtA, amount);
        tokenAfter = await getTokenBalance(bankAProvider, dvtA, bankAWalletOfDvtA.address);
        console.log("bankA dvtA balance after mint is : ", tokenAfter);
        increase = parseInt(tokenAfter.toString()) - parseInt(tokenBefore.toString());
        assert.strictEqual(increase, amount, 'Mint operation failed. Token balance increase is not as expected.');
    })

    it("mint tokens to user and bank accounts on bankB node", async () => {
        const amount = 20000;
        console.log("------------ start to mint dvtB to userB ------------")
        tokenBefore = await getTokenBalance(bankBProvider, dvtB, userBWallet.address);
        console.log("bankA dvtA token balance before mint is : ", tokenBefore);
        await mintToken(bankBProvider, dvtB, userBWallet, amount);
        tokenAfter = await getTokenBalance(bankBProvider, dvtB, userBWallet.address);
        console.log("bankA dvtA balance after mint is : ", tokenAfter);
        increase = parseInt(tokenAfter.toString()) - parseInt(tokenBefore.toString());
        assert.strictEqual(increase, amount, 'Mint operation failed. Token balance increase is not as expected.');
        console.log("------------ start to mint dvtB to bankB address ------------")
        tokenBefore = await getTokenBalance(bankBProvider, dvtB, bankBWalletOfDvtB.address);
        console.log("bank account token balance before mint is : ", tokenBefore);
        await mintToken(bankBProvider, dvtB, bankBWalletOfDvtB, amount);
        tokenAfter = await getTokenBalance(bankBProvider, dvtB, bankBWalletOfDvtB.address);
        console.log("bank account  balance after mint is : ", tokenAfter);
        increase = parseInt(tokenAfter.toString()) - parseInt(tokenBefore.toString());
        assert.strictEqual(increase, amount, 'Mint operation failed. Token balance increase is not as expected.');
    })
    it("mint tokens to bank accounts on centralBank node", async () => {
        const amount = 20000;
        console.log("------------ start to mint Drex to bankA address ------------")
        let tokenBefore = await getTokenBalance(centralBankProvider, drex, bankAWalletOfCBDC.address);
        console.log("bank account token balance before mint is : ", tokenBefore);
        await mintToken(centralBankProvider, drex, bankAWalletOfCBDC, amount);
        let tokenAfter = await getTokenBalance(centralBankProvider, drex, bankAWalletOfCBDC.address);
        console.log("bank account  balance after mint is : ", tokenAfter);
        let increase = parseInt(tokenAfter.toString()) - parseInt(tokenBefore.toString());
        assert.strictEqual(increase, amount, 'Mint operation failed. Token balance increase is not as expected.');
        console.log("------------ start to mint Drex to bankB address ------------")
        tokenBefore = await getTokenBalance(centralBankProvider, drex, bankBWalletOfCBDC.address);
        console.log("bank account token balance before mint is : ", tokenBefore);
        await mintToken(centralBankProvider, drex, bankBWalletOfCBDC, amount);
        tokenAfter = await getTokenBalance(centralBankProvider, drex, bankBWalletOfCBDC.address);
        console.log("bank account  balance after mint is : ", tokenAfter);
        increase = parseInt(tokenAfter.toString()) - parseInt(tokenBefore.toString());
        assert.strictEqual(increase, amount, 'Mint operation failed. Token balance increase is not as expected.');
    })
})

describe('Test internal transfer within a bank ', function () {
    this.timeout(120000);
    before(async function () {
        SimpleFactory = await ethers.getContractFactory("Simple");
    })
    it("userA internal transfer to userC in bankA", async () => {
        const amount = 100n;
        const token = SimpleFactory.attach(dvtA).connect(userAWallet);
        let tokenBeforeA = await getTokenBalance(bankAProvider, dvtA, userAWallet.address);
        let tokenBeforeC = await getTokenBalance(bankAProvider, dvtA, userCWallet.address);
        //internal transfer
        let tx = await token.transfer(userCWallet.address, amount);
        await tx.wait()
        // assertion
        let tokenAfterA = await getTokenBalance(bankAProvider, dvtA, userAWallet.address);
        let tokenAfterC = await getTokenBalance(bankAProvider, dvtA, userCWallet.address);

        expect(tokenAfterC - tokenBeforeC).equal(amount, 'After tranfer, recevier token balance should increase');
        expect(tokenBeforeA - tokenAfterA).equal(amount, 'After tranfer, sender token balance should increase');
    })
})

describe('Test L2 node cross bank transfer', function () {
    // Set a timeout of 1200000 milliseconds for this testsuit
    this.timeout(1200000);
    let chunkHash1, chunkHash2, chunkHash3, bundleHash1;
    let amount = 10;
    before(async function () {
        //Get the contract factories for Simple and DvpEscrow before running the tests.
        SimpleFactory = await ethers.getContractFactory("Simple");
        DvpEscrowFactory = await ethers.getContractFactory("DvpEscrow");
        await checkTokenBalance(bankAProvider, dvtA, userAWallet, amount)
        await checkTokenBalance(bankBProvider, dvtB, bankBWalletOfDvtB, amount)
    })
    beforeEach(async function () {
        // Generate random chunk hashes and calculate a bundle hash before each test.
        chunkHash1 = "0x" + crypto.randomBytes(32).toString("hex");
        chunkHash2 = "0x" + crypto.randomBytes(32).toString("hex");
        chunkHash3 = 0;
        bundleHash1 ="0x" + p.poseidon3([chunkHash1, chunkHash2, chunkHash3]).toString(16).padStart(64,"0");
    });

    it("dvp scheduleTransfer", async () => {
        console.log("------------start test ------------")
        console.log("hash is ", {chunkHash1, chunkHash2, bundleHash1})
        // Define the transfer amount and expiration time 5 minutes.
        const amount = 100;
        const expireTime = Math.floor(Date.now() / 1000) + 60 * 5;
        // // get account token balance before the cross bank transfer
        let userABalanceBefore = await getTokenBalance(bankAProvider, dvtA, userAWallet.address);
        // let userBBalanceBefore = await getTokenBalance(bankBProvider, dvtB, userBWallet.address);
        let bankBOfTokenBBefore = await getTokenBalance(bankBProvider, dvtB, bankBWalletOfDvtB.address);

        // console.log("userA balance before tranfer is:  ", userABalanceBefore);
        // console.log("bankB balance before tranfer is:  ", bankBOfTokenBBefore);
        // tranfer dvtA from userA to bankB address in BankA
        console.log("1.start to tranfer amount from userA to targetBank")
        if (userABalanceBefore >= amount && bankBOfTokenBBefore >= amount) {
            // Attach the dvtA token contract to userA wallet
            let DvtAToken = SimpleFactory.attach(dvtA).connect(userAWallet);
            // Approve the transfer amount of dvtA token to dvtAEscortingAddress
            let txApprove = await DvtAToken.approve(dvtAEscortingAddress, amount);
            await txApprove.wait();
            // Attach the DvpEscrow contract for dvtA to userA's wallet.
            let dvtAEscorting = await DvpEscrowFactory.attach(dvtAEscortingAddress).connect(userAWallet);
            let scheduleRequest = {
                tokenAddress: dvtA,
                to: bankBWalletOfDvtA.address,
                tokenType: 0,
                amount: amount,
                index: 0,
                chunkHash: chunkHash1,
                bundleHash: bundleHash1,
                expireTime: expireTime
            }
            // DvtEscorting scheduleTransfer to bankB account in bankA with  and expireTime
            let txTranfer = await dvtAEscorting.scheduleTransfer(scheduleRequest);
            await txTranfer.wait();
            console.log("2.start to tranfer amount from bank account to userB in target bank")
            // Attach to dvtB token contract to bankB wallet
            let DvtBToken = SimpleFactory.attach(dvtB).connect(bankBWalletOfDvtB);
            // approve the amount token to escorting contract
            txApprove = await DvtBToken.approve(dvtBEscortingAddress, amount);
            await txApprove.wait();
            // Attach to escorting contract to bankB wallet
            let dvtBEscorting = await DvpEscrowFactory.attach(dvtBEscortingAddress).connect(bankBWalletOfDvtB);
            // escorting schenduleTransfer with bundleHash and expireTime
            scheduleRequest = {
                tokenAddress: dvtB,
                to: userBWallet.address,
                tokenType: 0,
                amount: amount,
                index: 1,
                chunkHash: chunkHash2,
                bundleHash: bundleHash1,
                expireTime: expireTime
            }
            txTranfer = await dvtBEscorting.scheduleTransfer(scheduleRequest);
            await txTranfer.wait();
            // wait checkBundleStatus;
            console.log("3.wait tranfer dvp done")
            // await checkBundleTransaction(bundleHash1, bankBProvider);
            await checkTransactionStatus(bundleHash1,userAWallet,dvtAEscorting)
            //assert the balance changes
            // let userABalanceAfter = await getTokenBalance(bankAProvider, dvtA, userAWallet.address);
            // let userBBalanceAfter = await getTokenBalance(bankBProvider, dvtB, userBWallet.address);
            // expect(userABalanceAfter).equal(userABalanceBefore - amount, 'crossbank operation failed, userA amount changes is not excepted.');
            // expect(userBBalanceAfter).equal(userBBalanceBefore + amount, 'crossbank operation failed, userB amount changes is not excepted.');

        } else {
            throw new Error("Insufficient balance for transfer");
            if (userABalanceBefore < amount) {
                throw new Error("Insufficient balance for userA account, please mint dvtA token to userA")
            } else {
                throw new Error("Insufficient balance for bankB account, please mint dvtB token to bankB")
            }
        }
    })

})
describe('Test L2 node cross bank settlement', function () {
    // Set a timeout of 1200000 milliseconds for this testsuit
    this.timeout(1200000);
    let chunkHash1, chunkHash2, chunkHash3, bundleHash1;
    before(async function () {
        //Get the contract factories for Simple and DvpEscrow before running the tests.
        SimpleFactory = await ethers.getContractFactory("Simple");
        DvpEscrowFactory = await ethers.getContractFactory("DvpEscrow");
    })
    const amount = 10n;
    beforeEach(async function () {
        // Generate random chunk hashes and calculate a bundle hash before each test.
        chunkHash1 = "0x" + crypto.randomBytes(32).toString("hex");
        chunkHash2 = "0x" + crypto.randomBytes(32).toString("hex");
        chunkHash3 = 0;
        bundleHash1 ="0x" + p.poseidon3([chunkHash1, chunkHash2, chunkHash3]).toString(16).padStart(64,"0");
        await checkTokenBalance(bankAProvider, dvtA, bankBWalletOfDvtA, amount);
    })
    it("settlement", async () => {
        console.log("------------start test ------------")
        console.log("hash is ", {chunkHash1, chunkHash2, bundleHash1})
        // Define the settlement amount and expiration time 5 minutes.
        const amount = 100n;
        const expireTime = Math.floor(Date.now() / 1000) + 60 * 5;
        // get account token balance before the cross bank settlement
        let bankBOfTokenABefore = await getTokenBalance(bankAProvider, dvtA, bankBWalletOfDvtA.address);
        let bankBOfDrexBefore = await getTokenBalance(centralBankProvider, drex, bankBWalletOfCBDC.address);

        console.log("bankB balance of dvtA before settlement is:  ", bankBOfTokenABefore);
        console.log("bankB balance of Drex before settlement is:  ", bankBOfDrexBefore);
        console.log("1.start to burn dvtA in bankA")
        if (bankBOfTokenABefore >= amount) {
            // Attach the dvtA token contract to bankB wallet
            let DvtAToken = SimpleFactory.attach(dvtA).connect(bankBWalletOfDvtA);
            // Approve the amount of dvtA token to dvtAEscortingAddress
            let txApprove = await DvtAToken.approve(dvtAEscortingAddress, amount);
            await txApprove.wait();
            // Attach the DvpEscrow contract for dvtA to bankB's wallet.
            let dvtAEscorting = await DvpEscrowFactory.attach(dvtAEscortingAddress).connect(bankBWalletOfDvtA);
            // DvtEscorting scheduleBurn with bundleHash and expireTime
            scheduleRequest = {
                tokenAddress: dvtA,
                to: ethers.ZeroAddress,
                tokenType: 0,
                amount: amount,
                index: 0,
                chunkHash: chunkHash1,
                bundleHash: bundleHash1,
                expireTime: expireTime

            }
            let txBurn = await dvtAEscorting.scheduleBurn(scheduleRequest);
            await txBurn.wait();
            //mint drex to bankB  in centralBank
            console.log("2.settlement, start to mint amount to targetBank in centralBank")
            let drexEscroting = await DvpEscrowFactory.attach(drexEscrotingAddress).connect(bankBWalletOfCBDC);
            scheduleRequest = {
                tokenAddress: drex,
                to: bankBWalletOfCBDC.address,
                tokenType: 0,
                amount: amount,
                index: 1,
                chunkHash: chunkHash2,
                bundleHash: bundleHash1,
                expireTime: expireTime
            }
            let txMint = await drexEscroting.scheduleMint(scheduleRequest);
            await txMint.wait()
            console.log("3.wait the drex node done")
            // await checkBundleTransaction(bundleHash1, bankAProvider);
            await checkTransactionStatus(bundleHash1,bankBWalletOfCBDC,drexEscrotingAddress)
            //assert the balance changes
            let bankBOfTokenAAfter = await getTokenBalance(bankAProvider, dvtA, bankBWalletOfDvtA.address);
            let bankBOfDrexAfter = await getTokenBalance(centralBankProvider, drex, bankBWalletOfCBDC.address);
            console.log("bankB dvtA balance after settlement is ", bankBOfTokenAAfter);
            console.log("bankB drex balance after settlement is ", bankBOfDrexAfter);
            expect(bankBOfDrexAfter).equal(bankBOfDrexBefore + amount, 'crossbank settlement failed, bankB drex amount changes is not excepted.');
            expect(bankBOfTokenAAfter).equal(bankBOfTokenABefore - amount, 'crossbank settlement failed, bankB token amount changes is not excepted.');

        } else {
            throw new Error("Insufficient balance for settlement");
        }
    })
})

