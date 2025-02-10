const hre = require("hardhat");
const {ethers} = hre;
const p = require('poseidon-lite');
const crypto = require('crypto');



const poseidonHashAddress="0x7a3e5C3ABa993f3AC5bA224AFAAbd88D7Aa54675"
const poseidonT4Address="0x781C70103DFe046FA50e1B84D4c23B762400Ce36"
const dvpMatchAddress="0xA3aD7D9CB5620AA6137fD8cDCFEE5F632431f270"
const l1VerifierAddress="0xa215B05dfeA57D2CFCFf2a4965c52278bED543C1"

async function testMatchVariables(){
    const [deployer, account1, account2] = await ethers.getSigners()

    const DvpMatch = await ethers.getContractFactory("DvpMatch",  {
        signer: deployer[0],
        libraries: {
            PoseidonHasher: poseidonHashAddress,
            PoseidonT4: poseidonT4Address
        }});
    const match = DvpMatch.attach(dvpMatchAddress);

    let bundleHash="0x2e83fc623375167f794783eb4d91c68546ad593b465d1d24269888d28df08934"

    console.log("bundle", await match.bundleMap(bundleHash));
    console.log("expired", await match.bundleExpired(bundleHash));
    console.log("filled", await match.bundleFilled(bundleHash));
}

async function getCode() {
    let code  = await  ethers.provider.getCode(dvpMatchAddress);
    console.log("L1 match code: ", code);
    code = await ethers.provider.getCode(l1VerifierAddress);
    console.log("L1 verifier code: ", code)
}


testMatchVariables().then()
// getCode().then()
