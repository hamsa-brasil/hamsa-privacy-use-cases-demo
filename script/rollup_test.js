const hre = require("hardhat");
const {ignition, ethers} = hre;

const verifyAddress = "0x35acFab7B419b5b95c151BE6a5d2d0a404e47E21";
// node
const msftRpcUrl = 'http://18.183.58.228:8124';
//rollup_task of address
let contractAddress = "0x993120Ffa250CF1879880D440cff0176752c17C2";

const customNetwork = {
    name: "HAMSA",
    chainId: 1001
};

const options = {
    batchMaxCount: 1,
    staticNetwork: true
};
const msftProvider = new ethers.JsonRpcProvider(msftRpcUrl, customNetwork, options);

async function getProof() {
    // Replace the tx_hashes value of the rollup_task table
    const hash = "0x2de8b94c7e72f0157f7c603f5d4b955c58f8c1d2d9df9a4e8847f13352158f8f";
    let info = await msftProvider.send("eth_getTransactionByHash", [hash, false]);
    console.log("info", info.transactionProof[0]);
    const txRoot = decimalToHex(info.transactionProof[0].txProof.root);
    const acc1Root = decimalToHex(info.transactionProof[0].accountProofs.senderProof.fromRoot);
    const acc2Root = decimalToHex(info.transactionProof[0].accountProofs.receiverProof.toRoot);

    // 返回一个对象
    return {txRoot, acc1Root, acc2Root};
}

function decimalToHex(decimalStr) {
    // 将十进制字符串转换为大整数
    const bigInt = BigInt(decimalStr);
    // 转换为十六进制并去掉前缀 '0x'
    return bigInt.toString(16);
}

async function main() {
    const {txRoot, acc1Root, acc2Root} = await getProof();
    console.log("txroot", txRoot);
    console.log("acc1 root", acc1Root);
    console.log("acc2 root", acc2Root);

    const RelaxedR1CSSNARKForSMLib = await ethers.getContractFactory("RelaxedR1CSSNARKForSMLib");
    const relaxedR1CSSNARKForSMLib = await RelaxedR1CSSNARKForSMLib.deploy();
    await relaxedR1CSSNARKForSMLib.waitForDeployment();
    // console.log("RelaxedR1CSSNARKForSMLib deployed to:", relaxedR1CSSNARKForSMLib.target);

    const BatchedRelaxedR1CSSNARKLib = await ethers.getContractFactory("BatchedRelaxedR1CSSNARKLib");
    const batchedRelaxedR1CSSNARKLib = await BatchedRelaxedR1CSSNARKLib.deploy();
    await batchedRelaxedR1CSSNARKLib.waitForDeployment();

    const CompressedSnarkKib = await ethers.getContractFactory("CompressedSNARKLib");
    const compressedSnarkLib = await CompressedSnarkKib.deploy();
    await compressedSnarkLib.waitForDeployment();

    const CompressedSNARKVerifierKeyLib = await ethers.getContractFactory("CompressedSNARKVerifierKeyLib");
    const compressedSNARKVerifierKeyLib = await CompressedSNARKVerifierKeyLib.deploy();
    await compressedSNARKVerifierKeyLib.waitForDeployment();

    const ZkVerifier = await ethers.getContractFactory("ZkVerifier", {
        libraries: {
            RelaxedR1CSSNARKForSMLib: relaxedR1CSSNARKForSMLib.target,
            // CompressedSNARKLib: compressedSnarkLib.target,
            // CompressedSNARKVerifierKeyLib: compressedSNARKVerifierKeyLib.target,
            BatchedRelaxedR1CSSNARKLib: batchedRelaxedR1CSSNARKLib.target
        },
    });


    const zkVerifier = await ZkVerifier.deploy();
    await zkVerifier.waitForDeployment()
    console.log("ZkVerifier deployed to:", zkVerifier.target);


    const SimpleVerifier =
        await ethers.getContractFactory("RootStorage", {
            libraries: {
                ZkVerifier: zkVerifier.target,
            },
        });

    const simpleVerifier = await SimpleVerifier.attach(verifyAddress);

    console.log("VerifierContract deployed to:", simpleVerifier.target);

    let tRoot = "0x" + txRoot;
    let bRoot = "0x" + acc1Root;
    let b2Root = "0x" + acc2Root;


    let resultRootExist1 = await simpleVerifier.queryTxRootExist(contractAddress, tRoot);
    console.log("root txroot exist? :", resultRootExist1);

    let resultRootExist2 = await simpleVerifier.queryBalanceRootExist(contractAddress, bRoot);
    console.log("root intermediate1 exist? :", resultRootExist2);
    let resultRootExist3 = await simpleVerifier.queryBalanceRootExist(contractAddress, b2Root);
    console.log("root intermediate2 exist? :", resultRootExist3);

    // // let resultLatest = await simpleVerifier.getLatestBalanceRoot(addrcontractAddressessTest);
    // // console.log("latest balance for addr is :", resultLatest);

}

main().then()


