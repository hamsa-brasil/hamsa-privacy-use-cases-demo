const hre = require("hardhat");

async function deploy() {
    // Get the deployer account from the list of signers.
    const [deployer] = await ethers.getSigners();
    // Get the contract factory for the "Simple" contract.
    const HamsaToken = await ethers.getContractFactory("HamsaToken");
    // Deploy the "Simple" contract with the provided constructor arguments.
    const simple = await HamsaToken.deploy();
    await simple.waitForDeployment()
    // Log the address where the contract is deployed.
    console.log("test token is deployed to:", simple.target)
    const tx = await simple.mint(await deployer.getAddress(), 100);
    await tx.wait();
    // let balance = await HamsaToken.balanceOf(deployer.getAddress());
    // console.log("amsaToken.balanceOf:", balance);


}

async function play() {
    const [deployer, depositor] = await ethers.getSigners();
    const HamsaToken = await ethers.getContractFactory("HamsaToken");
    // Deploy the "Simple" contract with the provided constructor arguments.
    const child = await HamsaToken.deploy();
    await child.waitForDeployment()
    // Log the address where the contract is deployed.
    console.log("test token is deployed to:", child.target)
    // let address = "0x854c622002B96dee16e2698c41F2a09954D71F84";
    // const child = await hre.ethers.getContractAt("HamsaToken", address)

    // 测试mint
    console.log("deployer mint 1000000 ")
    let txmint = await child.mint(deployer.address, 1000000)
    await txmint.wait()
    const balance = await child.balanceOf(deployer.address)
    console.log("deployer: " + balance)

    // 测试transfer
    console.log("Transfer 测试transfer 10000")
    let txTransfer = await child.transfer(depositor.address, 10000)
    await txTransfer.wait()


    // 测试 burn
    console.log("burn deployer 100000000")
    let tx3 = await child.burn(10000)
    await tx3.wait()


}

deploy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });