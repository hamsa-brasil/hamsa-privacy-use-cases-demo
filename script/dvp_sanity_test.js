const hre = require("hardhat");
const {ethers} = hre;
const p = require('poseidon-lite');
const crypto = require("crypto");
const assert = require('assert');
const {Wallet} = require("ethers");
const chai = require("chai");
const expect = chai.expect;
const hardhatConfig = require('../hardhat.config');

const escortingAddress ='0x993120Ffa250CF1879880D440cff0176752c17C2'


const customNetwork = {
    name: "HAMSA",
    chainId: 1001
};

const options = {
    batchMaxCount: 1,
    staticNetwork: true
};

const customerAKey ="1fc9cb8571b3bc33a733f4a2b89bad0b2670e52eeec65db0a7622fc85f113484"
const customerBKey = "25535682af0cef01617e38366b0250df584a96fd390c5bc7751c265103a07ce2"
const L1Key="32ef95df4ea8de4f6b5518106e97dbb3e5b97cdbb4a33adfeaa9f14e729f51eb";

const bankARpcUrl = hardhatConfig.networks.server_L2_2.url;
const bankBRpcUrl = hardhatConfig.networks.server_L2_3.url;

const bankAProvider = new ethers.JsonRpcProvider(bankARpcUrl, customNetwork, options);
const walletA= new ethers.Wallet(customerAKey, bankAProvider);


const bankBProvider = new ethers.JsonRpcProvider(bankBRpcUrl, customNetwork, options);
const walletB = new ethers.Wallet(customerBKey, bankBProvider);

let simpleA_address= "0x3F0c1A7038e495c62Ae67331F1d960C3B8892b38"
let simpleB_address="0x5D735DB037d90ad74a0F9584308E02772aDE514a"


async function deploySimple(wallet) {
    const SimpleToken = await ethers.getContractFactory("Simple", wallet);
    const simple = await SimpleToken.deploy("simple", "$simple")
    await simple.waitForDeployment();
    let tokenAddress = await simple.getAddress();
    return tokenAddress
}

async function checkCustomerBalance(tokenAddress, wallet){
    const SimpleToken = await ethers.getContractFactory("Simple");
    let simple = SimpleToken.attach(tokenAddress).connect(wallet)
    let result = await simple.balanceOf(wallet.address)
    console.log("result", result)
}


async function checkPayeeBalance(tokenAddress, wallet){
    const SimpleToken = await ethers.getContractFactory("Simple");
    let simple = SimpleToken.attach(tokenAddress).connect(wallet)

    let result = await simple.balanceOf(escortingAddress)
    console.log("escrow balance: ", result)

     result = await simple.balanceOf("0x08883F8d938055aed23b0A64dcd7fD140028F648")
    console.log("payee balance: ", result)
}


async function customerAScheduleTransfer(chunkHash, bundleHash) {
    const SimpleToken = await ethers.getContractFactory("Simple");
    let simple = SimpleToken.attach(simpleA_address).connect(walletA)

    let tx = await simple.approve(escortingAddress, 100);
    await tx.wait();


    let expire=Math.floor(Date.now() / 1000) + 60*20
    let schduleRequest= {
        tokenAddress: simpleA_address,
        to: '0x08883F8d938055aed23b0A64dcd7fD140028F648',
        tokenType: 0,
        amount:100,

        index:0,
        chunkHash: chunkHash,
        bundleHash: bundleHash,
        expireTime:expire
    }

    const DvpEscrow = await ethers.getContractFactory("DvpEscrow");
    const dvpEscrow = await DvpEscrow.attach(escortingAddress).connect(walletA);

    tx = await dvpEscrow.scheduleTransfer(schduleRequest);
    await tx.wait();
}

async function customerBScheduleTransfer(chunkHash, bundleHash) {
    const SimpleToken = await ethers.getContractFactory("Simple");
    let simple = SimpleToken.attach(simpleB_address).connect(walletB)

    let tx = await simple.approve(escortingAddress, 100);
    await tx.wait();


    let expire=Math.floor(Date.now() / 1000) + 60*20
    let schduleRequest= {
        tokenAddress: simpleB_address,
        to: '0x08883F8d938055aed23b0A64dcd7fD140028F648',
        tokenType: 0,
        amount:100,

        index:1,
        chunkHash: chunkHash,
        bundleHash: bundleHash,
        expireTime:expire
    }

    const DvpEscrow = await ethers.getContractFactory("DvpEscrow");
    const dvpEscrow = await DvpEscrow.attach(escortingAddress).connect(walletB);

    tx = await dvpEscrow.scheduleTransfer(schduleRequest);
    await tx.wait();
}

function generateHash() {
    let chunkHash1 = "0x"+ crypto.randomBytes(32).toString("hex");
    let chunkHash2 = "0x" +  crypto.randomBytes(32).toString("hex");

    let hash= p.poseidon3([chunkHash1, chunkHash2, 0]);
    let bundleHash = "0x" + hash.toString(16).padStart(64,"0");
    return [chunkHash1, chunkHash2, bundleHash]
}

async function executeDvp(){
    let [chunkHash1, chunkHash2, bundleHash, hash] =generateHash();
    console.log("chunkHash1: ", chunkHash1)
    console.log("chunkHash2: ", chunkHash2)
    console.log("bundlehash: ", bundleHash)

    simpleA_address = await deploySimple(walletA);
    console.log("simpleA_address: ", simpleA_address)

    simpleB_address = await deploySimple(walletB);
    console.log("simpleB_address: ", simpleB_address)


    await customerAScheduleTransfer(chunkHash1, bundleHash);
    await customerBScheduleTransfer(chunkHash2, bundleHash);
}


async function checkTransactionStatus(){
    const DvpEscrow = await ethers.getContractFactory("DvpEscrow");
    const dvpEscrow = await DvpEscrow.attach(escortingAddress).connect(walletA);
    let slot  = await dvpEscrow.Transactions("0x0bfaf1cfd025636e484e2b236c04df13ad37ada17386ef28a3e057a24e3013e4")

    console.log("slot: ", slot)
}

async function checkL1Status() {

}

// deploySimple(walletA).then()
// checkCustomerBalance(simpleA_address, walletA).then();

// deploySimple(walletB).then()
// checkCustomerBalance(simpleB_address, walletB).then();
executeDvp().then()
// checkPayeeBalance(simpleA_address, walletA).then()

// checkTransactionStatus().then()