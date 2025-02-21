const hre = require("hardhat");
const { ethers } = hre;
const p = require("poseidon-lite");
const crypto = require("crypto");
const hardhatConfig = require("../hardhat.config");

const customNetwork = {
    name: "UCL",
    chainId: 1001,
};

const options = {
    batchMaxCount: 1,
    staticNetwork: true,
};

const centralBankRpcUrl = hardhatConfig.networks.server_L2_1.url;
const selicRpcUrl = hardhatConfig.networks.server_L2_2.url;
const bank1RpcUrl = hardhatConfig.networks.server_L2_3.url;
const bank2RpcUrl = hardhatConfig.networks.server_L2_4.url;

const selicProvider = new ethers.JsonRpcProvider(
    selicRpcUrl,
    customNetwork,
    options
);
const centralBankProvider = new ethers.JsonRpcProvider(
    centralBankRpcUrl,
    customNetwork,
    options
);
const bank1Provider = new ethers.JsonRpcProvider(
    bank1RpcUrl,
    customNetwork,
    options
);
const bank2Provider = new ethers.JsonRpcProvider(
    bank2RpcUrl,
    customNetwork,
    options
);

const selicEscrotingAddress = "0x993120Ffa250CF1879880D440cff0176752c17C2";
const centralBankEscrotingAddress =
    "0x993120Ffa250CF1879880D440cff0176752c17C2";
const bank1EscrotingAddress = "0x993120Ffa250CF1879880D440cff0176752c17C2";
const bank2EscrotingAddress = "0x993120Ffa250CF1879880D440cff0176752c17C2";

class BankInfo {
    constructor(
        bankName,
        address,
        privateKey,
        cnpj8,
        provider,
        dvpEscrotingAddress
    ) {
        this.bankName = bankName;
        this.address = address;
        this.privateKey = privateKey;
        this.cnpj8 = cnpj8;
        this.provider = provider;
        this.dvpEscrotingAddress = dvpEscrotingAddress;
    }
}

const selicInfo = new BankInfo(
    "CentralTreasury",
    "0x9E46a01F1A486095A073BFeB4B3c9e106dfB0e7E",
    "0x6741001f80a9194d8d65f04d8b420940e83babc1a1dea5afa8775c395ed14ae8",
    11111111,
    selicProvider,
    selicEscrotingAddress
);
const centralBankInfo = new BankInfo(
    "CentralBank",
    "0x9E46a01F1A486095A073BFeB4B3c9e106dfB0e7E",
    "0x6741001f80a9194d8d65f04d8b420940e83babc1a1dea5afa8775c395ed14ae8",
    12345678,
    centralBankProvider,
    centralBankEscrotingAddress
);
const bank1Info = new BankInfo(
    "BankA",
    "0xa1608Fc30958cD232de765b003D4f3A4995049b6",
    "0x0740d6df0c4fb2cc880f14a72ac7118ede6d0613417ef35a92a73d9344ad0d0b",
    77765432,
    bank1Provider,
    bank1EscrotingAddress
);
const bank2Info = new BankInfo(
    "BankB",
    "0xe46Fe251dd1d9FfC247bc0DDb6D61e4EE4416ecB",
    "0x555332672ce947d150d23a36bf3847078291f89bda7073829bb718c77d626787",
    23578902,
    bank2Provider,
    bank2EscrotingAddress
);

const acronym = "LTN";
const code = "1001";
const maturityDate = 1755734400;


const addressDiscoveryAddress = process.env.ADDRESS_DISCOVERY //"0x3E8C179f7a26a58d2F86e4104bB2ffB77626FacC"


async function getAddressDiscovery() {
    const centralBankWallet = new ethers.Wallet(
        centralBankInfo.privateKey,
        centralBankInfo.provider
    );
    const addressDiscoveryFactory = await ethers.getContractFactory(
        "AddressDiscovery"
    );
    return addressDiscoveryFactory
        .attach(addressDiscoveryAddress)
        .connect(centralBankWallet);
}

async function getContract(addressDiscoveryKey, contractName) {
    const addressDiscovery = await getAddressDiscovery();
    const hash = ethers.keccak256(ethers.toUtf8Bytes(addressDiscoveryKey));
    const contractAddress = await addressDiscovery.addressDiscovery(hash);
    const contractFactory = await ethers.getContractFactory(contractName);
    return contractFactory.attach(contractAddress);
}

const displayBalance = (value) => (parseFloat(value) / 100).toFixed(2);

async function getRDBalance(buyer) {
    const bankWallet = new ethers.Wallet(
        buyer.privateKey,
        centralBankInfo.provider
    );

    // Connects to the RealDigital contract using the bank wallet.
    const realDigital = (await getContract("RealDigital", "RealDigital")).connect(
        bankWallet
    );

    const balance = await realDigital.balanceOf(buyer.address);

    console.log(`${buyer.bankName} REAL DIGITAL: ${displayBalance(balance)}`)

}

async function getTPFtBalance(bank) {
    let bankWallet = new ethers.Wallet(
        bank.privateKey,
        selicInfo.provider
    );

    const tpftData = {
        acronym: acronym,
        code: code,
        maturityDate: maturityDate,
    };

    try {
        const tpft = (await getContract("TPFt", "TPFt")).connect(bankWallet);
        const id = await tpft.getTPFtId(tpftData);
        const balance = await tpft.balanceOf(bank.address, id);

        console.log(`BALANÇO DE ${bank.bankName} DE TPFt (ID: ${id}): ${displayBalance(balance)}`)
    } catch (err) {
        console.error(err)
    }

}

async function main() {
    console.log(process.env.ADDRESS_DISCOVERY)
    console.log(selicRpcUrl,  "\n")

    console.info(`\nBalance of Real Digital`)
    await getRDBalance(bank1Info)
    await getRDBalance(bank2Info)
    
    console.info(`\nBalance of TPFt`)
    await getTPFtBalance(centralBankInfo)
    await getTPFtBalance(selicInfo)
    await getTPFtBalance(bank1Info)
    await getTPFtBalance(bank2Info)
    // try {
        
    // const rpcResult =  await fetch(bank1RpcUrl, {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify(
    //         {"jsonrpc": "2.0","method": "eth_getBalance", "params": ["0xe46Fe251dd1d9FfC247bc0DDb6D61e4EE4416ecB", "latest"], "id": 1}
    //     )
    // }).then(result => result.json())

    // console.log(parseInt(rpcResult.result))
    // } catch(e) {
    //     console.error(e)
    // }
}

main().then()



