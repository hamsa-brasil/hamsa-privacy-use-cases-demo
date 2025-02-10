const hre = require("hardhat");
const { ethers } = hre;
const p = require("poseidon-lite");
const crypto = require("crypto");
const hardhatConfig = require("../hardhat.config.hamsa");

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

class ClientInfo {
  constructor(
    clientName,
    taxId,
    bankNumber,
    account,
    branch,
    wallet,
    owner,
    privateKey
  ) {
    this.clientName = clientName;
    this.taxId = taxId;
    this.bankNumber = bankNumber;
    this.account = account;
    this.branch = branch;
    this.wallet = wallet;
    this.owner = owner;
    this.privateKey = privateKey;
  }
}

const client1Address = "0x23eabdd1584Cc04E5962524F48B9c6f4d1Ef98cD";
const client1PrivateKey =
  "0x5f990426b4495f3d4f089ce948dca5365bf00d72b52c4e0f59bfdba1bd4593e0";

const client2Address = "0x977954402132612Cc1d144E57e16eaf0E4cbcfcB";
const client2PrivateKey =
  "0xc5446fda20f0b6ae6c24ababad898faa1251cc524783fabf4d84a673c41b74ef";

const client3Address = "0xf837a5d778a146CEDa51179c1744F6160735E2D5";
const client3PrivateKey =
  "e639ad85e461349045fd6b4b4d920e1cfd81bb36c6c5d049395587c4f8c4938d";

const client1 = new ClientInfo(
  "Client1-BankA",
  15355016212,
  121,
  15355016212,
  121,
  client1Address,
  bank1Info.address,
  client1PrivateKey
);
const client2 = new ClientInfo(
  "Client2-BankB",
  15355016213,
  122,
  15355016213,
  122,
  client2Address,
  bank2Info.address,
  client2PrivateKey
);
const client3 = new ClientInfo(
  "Client3-BankA",
  15355016214,
  121,
  15355016214,
  121,
  client3Address,
  bank1Info.address,
  client3PrivateKey
);

const acronym = "LTN";
const code = "1001";
const maturityDate = 1755734400;

// TODO Replace the deployed Discovery contract address
// let addressDiscoveryAddress = "0x78Df50284Bf941e19c5155dA07Bd53A99eC5Dd85";
let addressDiscoveryAddress = "0x1A565846A792C993BEa323C9A7e935c62B96A0D4";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function ethBalance(provider, account) {
  const balance = await provider.getBalance(account);
  console.log("balance", displayBalance(balance));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * This function deploys a set of contracts on the central bank node. It includes the deployment of:
 * - AddressDiscovery.sol
 * - KeyDictionary.sol
 * - RealDigital.sol
 * - RealDigitalDefaultAccount.sol
 * - RealDigitalEnableAccount.sol
 * - STR.sol
 * - TPFt.sol
 *
 * After deployment, it updates the addresses of these contracts in the AddressDiscovery contract.
 */
async function deployOnCentralBankNode() {
  let centralBankWallet = new ethers.Wallet(
    centralBankInfo.privateKey,
    centralBankInfo.provider
  );

  // Deploy the AddressDiscovery contract, which is used to map contract names to their addresses.
  console.log("deploying AddressDiscovery");
  let addressDiscoveryFactory = await ethers.getContractFactory(
    "AddressDiscovery",
    centralBankWallet
  );
  console.log("deploy AddressDiscovery")
  let addressDiscoveryContract = await addressDiscoveryFactory.deploy(
    centralBankInfo.address
  );
  await addressDiscoveryContract.waitForDeployment();
  console.log(
    "AddressDiscovery address:",
    addressDiscoveryContract.target,
    " (Copy that to use on the use cases!)"
  );
  addressDiscoveryAddress = addressDiscoveryContract.target;

  addressDiscoveryContract = await getAddressDiscovery();

  // Deploy the RealDigital contract, which represents a digital asset.
  console.log("deploying RealDigital");
  let realDigitalFactory = await ethers.getContractFactory(
    "RealDigital",
    centralBankWallet
  );
  let realDigitalContract = await realDigitalFactory.deploy(
    "BRL",
    "BRL",
    centralBankInfo.address
  );
  await realDigitalContract.waitForDeployment();
  console.log("RealDigital address:", realDigitalContract.target);

  // Deploy the KeyDictionary contract, which maps keys to customer data.
  console.log("deploying KeyDictionary");
  let keyDictionaryFactory = await ethers.getContractFactory(
    "KeyDictionary",
    centralBankWallet
  );
  let keyDictionaryContract = await keyDictionaryFactory.deploy(
    realDigitalContract
  );
  await keyDictionaryContract.waitForDeployment();
  console.log("KeyDictionary address:", keyDictionaryContract.target);

  // Deploy the RealDigitalDefaultAccount contract, which handles default accounts for RealDigital assets.
  console.log("deploying RealDigitalDefaultAccount");
  let realDigitalDefaultAccountFactory = await ethers.getContractFactory(
    "RealDigitalDefaultAccount",
    centralBankWallet
  );
  let realDigitalDefaultAccountContract =
    await realDigitalDefaultAccountFactory.deploy(
      realDigitalContract,
      centralBankInfo.address,
      centralBankInfo.address
    );
  await realDigitalDefaultAccountContract.waitForDeployment();
  console.log(
    "RealDigitalDefaultAccount address:",
    realDigitalDefaultAccountContract.target
  );

  // Deploy the RealDigitalEnableAccount contract, which enables accounts for RealDigital assets.
  console.log("deploying RealDigitalEnableAccount");
  let realDigitalEnableAccountFactory = await ethers.getContractFactory(
    "RealDigitalEnableAccount",
    centralBankWallet
  );
  let realDigitalEnableAccountContract =
    await realDigitalEnableAccountFactory.deploy(centralBankInfo.address);
  await realDigitalEnableAccountContract.waitForDeployment();
  console.log(
    "RealDigitalEnableAccount address:",
    realDigitalEnableAccountContract.target
  );

  // Deploy the STR contract, which is used for some other purpose.
  console.log("deploying STR");
  let strFactory = await ethers.getContractFactory("STR", centralBankWallet);
  let strContract = await strFactory.deploy(realDigitalContract);
  await strContract.waitForDeployment();
  console.log("STR address:", strContract.target);

  // Calculate the hash for RealDigital contract name and update its address in AddressDiscovery.
  console.log("updating RealDigital address in AddressDiscovery");
  const realDigitalHash = ethers.keccak256(ethers.toUtf8Bytes("RealDigital"));
  await addressDiscoveryContract.updateAddress(
    realDigitalHash,
    realDigitalContract.target
  );
  await sleep(3000);

  // Calculate the hash for KeyDictionary contract name and update its address in AddressDiscovery.
  console.log("updating KeyDictionary address in AddressDiscovery");
  const keyDictionaryHash = ethers.keccak256(
    ethers.toUtf8Bytes("KeyDictionary")
  );
  await addressDiscoveryContract.updateAddress(
    keyDictionaryHash,
    keyDictionaryContract.target
  );
  await sleep(3000);

  // Calculate the hash for RealDigitalDefaultAccount contract name and update its address in AddressDiscovery.
  console.log("updating RealDigitalDefaultAccount address in AddressDiscovery");
  const realDigitalDefaultAccountHash = ethers.keccak256(
    ethers.toUtf8Bytes("RealDigitalDefaultAccount")
  );
  await addressDiscoveryContract.updateAddress(
    realDigitalDefaultAccountHash,
    realDigitalDefaultAccountContract.target
  );
  await sleep(3000);

  // Calculate the hash for RealDigitalEnableAccount contract name and update its address in AddressDiscovery.
  console.log("updating RealDigitalEnableAccount address in AddressDiscovery");
  const realDigitalEnableAccountHash = ethers.keccak256(
    ethers.toUtf8Bytes("RealDigitalEnableAccount")
  );
  await addressDiscoveryContract.updateAddress(
    realDigitalEnableAccountHash,
    realDigitalEnableAccountContract.target
  );
  await sleep(3000);

  // Calculate the hash for STR contract name and update its address in AddressDiscovery.
  console.log("updating STR address in AddressDiscovery");
  const strHash = ethers.keccak256(ethers.toUtf8Bytes("STR"));
  await addressDiscoveryContract.updateAddress(strHash, strContract.target);
  await sleep(3000);

  console.log("deployOnCentralBankNode done...");

  return addressDiscoveryContract.target;
}

async function deployOnSelicNode() {
  let selicWallet = new ethers.Wallet(selicInfo.privateKey, selicInfo.provider);

  addressDiscoveryContract = await getAddressDiscovery();

  // Deploy the TPFt contract, which is the main contract for token processing and management.
  console.log("deploying TPFt");
  let tpftFactory = await ethers.getContractFactory("TPFt", selicWallet);
  let tpftContract = await tpftFactory.deploy();
  await tpftContract.waitForDeployment();
  console.log("TPFt address:", tpftContract.target);

  // Deploy the TPFtOperation1002 contract, which is used to manage order operations.
  console.log("deploying TPFtOperation1002");
  let tpftOperation1002Factory = await ethers.getContractFactory(
    "TPFtOperation1002",
    selicWallet
  );
  let tpftOperation1002Contract = await tpftOperation1002Factory.deploy(
    centralBankInfo.address
  );
  await tpftOperation1002Contract.waitForDeployment();
  console.log("TPFtOperation1002 address:", tpftOperation1002Contract.target);

  // Deploy the TPFtOperation1052 contract, which is used to manage order operations.
  console.log("deploying TPFtOperation1052");
  let tpftOperation1052Factory = await ethers.getContractFactory(
    "TPFtOperation1052",
    selicWallet
  );
  let tpftOperation1052Contract = await tpftOperation1052Factory.deploy(
    centralBankInfo.address
  );
  await tpftOperation1052Contract.waitForDeployment();
  console.log("TPFtOperation1052 address:", tpftOperation1052Contract.target);

  // Calculate the hash for TPFt contract name and update its address in AddressDiscovery.
  console.log("updating TPFt address in AddressDiscovery");
  const tpftHash = ethers.keccak256(ethers.toUtf8Bytes("TPFt"));
  await addressDiscoveryContract.updateAddress(tpftHash, tpftContract.target);
  await sleep(3000);

  // Calculate the hash for TPFtOperation1002 contract name and update its address in AddressDiscovery.
  console.log("updating TPFtOperation1002 address in AddressDiscovery");
  const tpftOperation1002Hash = ethers.keccak256(
    ethers.toUtf8Bytes("TPFtOperation1002")
  );
  await addressDiscoveryContract.updateAddress(
    tpftOperation1002Hash,
    tpftOperation1002Contract.target
  );
  await sleep(3000);

  // Calculate the hash for TPFtOperation1052 contract name and update its address in AddressDiscovery.
  console.log("updating TPFtOperation1052 address in AddressDiscovery");
  const tpftOperation1052Hash = ethers.keccak256(
    ethers.toUtf8Bytes("TPFtOperation1052")
  );
  await addressDiscoveryContract.updateAddress(
    tpftOperation1052Hash,
    tpftOperation1052Contract.target
  );
  await sleep(3000);

  console.log("deployOnSelicNode done...");
}

/**
 * Deploys contracts on the bank node.
 * This function is responsible for deploying the necessary contracts on the bank node.
 * It includes the deployment of RealDigitalEnableAccount and RealTokenizado contracts.
 */
async function deployOnBankNode(bankInfo) {
  let bankWallet = new ethers.Wallet(bankInfo.privateKey, bankInfo.provider);

  // Deploy the RealDigitalEnableAccount contract, which enables accounts for RealDigital assets.
  console.log("deploying RealDigitalEnableAccount");
  let realDigitalEnableAccountFactory = await ethers.getContractFactory(
    "RealDigitalEnableAccount",
    bankWallet
  );
  let realDigitalEnableAccountContract =
    await realDigitalEnableAccountFactory.deploy(bankInfo.address);
  await realDigitalEnableAccountContract.waitForDeployment();
  console.log(
    "RealDigitalEnableAccount address:",
    realDigitalEnableAccountContract.target
  );

  // Deploy the RealTokenizado contract, which is used for tokenization.
  console.log("deploying RealTokenizado");
  let realTokenizadoFactory = await ethers.getContractFactory(
    "RealTokenizado",
    bankWallet
  );
  let tokenName = "BRL@" + bankInfo.cnpj8;
  let realTokenizadoContract = await realTokenizadoFactory.deploy(
    tokenName,
    tokenName,
    bankInfo.address,
    bankInfo.address,
    bankInfo.cnpj8,
    bankInfo.address
  );
  await realTokenizadoContract.waitForDeployment();
  console.log("RealTokenizado address:", realTokenizadoContract.target);

  const addressDiscoveryContract = await getAddressDiscovery();

  // Calculate the hash for RealTokenizado contract name and update its address in AddressDiscovery.
  console.log("updating RealTokenizado address in AddressDiscovery");
  const realTokenizadoHash = ethers.keccak256(
    ethers.toUtf8Bytes("RealTokenizado@" + bankInfo.cnpj8)
  );
  await addressDiscoveryContract.updateAddress(
    realTokenizadoHash,
    realTokenizadoContract.target
  );
  await sleep(3000);

  // Calculate the hash for RealDigitalEnableAccount contract name and update its address in AddressDiscovery.
  console.log("updating RealDigitalEnableAccount address in AddressDiscovery");
  const realDigitalEnableAccountHash = ethers.keccak256(
    ethers.toUtf8Bytes("RealDigitalEnableAccount@" + bankInfo.cnpj8)
  );
  await addressDiscoveryContract.updateAddress(
    realDigitalEnableAccountHash,
    realDigitalEnableAccountContract.target
  );
  await sleep(3000);

  console.log("deployOnBankNode done...");
}

/**
 * Authorizes on the central bank node.
 * This function is responsible for authorizing the central bank node.
 * It includes the authorization of RealDigital and RealDigitalEnableAccount contracts.
 */
async function authorizeOnCentralBankNode() {
  // Initialize the central bank wallet and address discovery contract
  const centralBankWallet = new ethers.Wallet(
    centralBankInfo.privateKey,
    centralBankInfo.provider
  );

  const realDigital = (await getContract("RealDigital", "RealDigital")).connect(
    centralBankWallet
  );

  // Enable accounts for RealDigital assets
  console.log("Enabling accounts for RealDigital assets");
  await realDigital.enableAccount(bank1Info.address);
  await sleep(3000);
  await realDigital.enableAccount(bank2Info.address);
  await sleep(3000);
  await realDigital.enableAccount(selicInfo.address);
  await sleep(3000);

  // Grant MINTER_ROLE to STR
  console.log("Granting MINTER_ROLE to STR");
  const strAddress = (await getContract("STR", "STR")).target;
  await realDigital.grantRole(ethers.id("MINTER_ROLE"), strAddress);
  await sleep(3000);

  // Grant BURNER_ROLE to STR
  console.log("Granting BURNER_ROLE to STR");
  await realDigital.grantRole(ethers.id("BURNER_ROLE"), strAddress);
  await sleep(3000);

  // Grant MOVER_ROLE to bank1 and bank2
  console.log("Granting MOVER_ROLE to bank1 and bank2");
  await realDigital.grantRole(ethers.id("MOVER_ROLE"), bank1Info.address);
  await sleep(3000);
  await realDigital.grantRole(ethers.id("MOVER_ROLE"), bank2Info.address);
  await sleep(3000);

  const RealDigitalDefaultAccount = (
    await getContract("RealDigitalDefaultAccount", "RealDigitalDefaultAccount")
  ).connect(centralBankWallet);
  // Add default accounts for bank1 and bank2
  console.log("Adding default accounts for bank1 and bank2");
  await RealDigitalDefaultAccount.addDefaultAccount(
    bank1Info.cnpj8,
    bank1Info.address
  );
  await sleep(3000);
  await RealDigitalDefaultAccount.addDefaultAccount(
    bank2Info.cnpj8,
    bank2Info.address
  );
  await sleep(3000);

  // Grant MINTER_ROLE to DvpEscrow
  console.log("Granting MINTER_ROLE to DvpEscrow");
  await realDigital.grantRole(
    ethers.id("MINTER_ROLE"),
    centralBankEscrotingAddress
  );
  await sleep(3000);

  // Grant BURNER_ROLE to DvpEscrow
  console.log("Granting BURNER_ROLE to DvpEscrow");
  await realDigital.grantRole(
    ethers.id("BURNER_ROLE"),
    centralBankEscrotingAddress
  );
  await sleep(3000);

  // Grant MOVER_ROLE to DvpEscrow
  console.log("Granting MOVER_ROLE to DvpEscrow");
  await realDigital.grantRole(
    ethers.id("MOVER_ROLE"),
    centralBankEscrotingAddress
  );
  await sleep(3000);

  // Enable account for DvpEscrow
  await realDigital.enableAccount(centralBankEscrotingAddress);
  await sleep(3000);

  // Grant MINTER_ROLE to TPFt
  /*console.log("TPFt granting MINTER_ROLE to bank");
    const TPFt = (await getContract("TPFt", "TPFt")).connect(centralBankWallet);
    await TPFt.grantRole(ethers.id("MINTER_ROLE"), centralBankInfo.address);
    await sleep(3000);*/

  console.log("authorizeOnCentralBankNode done...");
}

async function authorizeOnSelicNode() {
  // Initialize the selic wallet and address discovery contract
  const selicWallet = new ethers.Wallet(
    selicInfo.privateKey,
    selicInfo.provider
  );

  // Grant MINTER_ROLE to TPFt
  console.log("TPFt granting MINTER_ROLE to selic wallet");
  const TPFt = (await getContract("TPFt", "TPFt")).connect(selicWallet);
  await TPFt.grantRole(ethers.id("MINTER_ROLE"), selicWallet.address);
  await sleep(3000);

  // set tpftAddress for TPFtOperation1002
  console.log("setting tpftAddress for TPFtOperation1002");
  const tpftOperation1002 = (
    await getContract("TPFtOperation1002", "TPFtOperation1002")
  ).connect(selicWallet);
  await tpftOperation1002.setTpftAddress(TPFt.target);
  await sleep(3000);

  // set tpftAddress for TPFtOperation1052
  console.log("setting tpftAddress for TPFtOperation1052");
  const tpftOperation1052 = (
    await getContract("TPFtOperation1052", "TPFtOperation1052")
  ).connect(selicWallet);
  await tpftOperation1052.setTpftAddress(TPFt.target);
  await sleep(3000);

  console.log("authorizeOnSelicNode done...");
}

/**
 * Authorizes on the bank node.
 * This function is responsible for authorizing the bank node.
 * It includes the authorization of RealTokenizado and KeyDictionary contracts.
 */
async function authorizeOnBankNode(bankInfo, clientInfo) {
  const bankWallet = new ethers.Wallet(bankInfo.privateKey, bankInfo.provider);
  const keyDictionary = (
    await getContract("KeyDictionary", "KeyDictionary")
  ).connect(bankWallet);

  const customerKey = ethers.id(clientInfo.taxId.toString());
  console.log("Adding account to KeyDictionary");
  await keyDictionary.addAccount(
    customerKey,
    clientInfo.taxId,
    clientInfo.bankNumber,
    clientInfo.account,
    clientInfo.branch,
    clientInfo.wallet
  );
  await sleep(3000);

  console.log("Enabling account on RealTokenizado");
  const realTokenizado = (
    await getContract("RealTokenizado@" + bankInfo.cnpj8, "RealTokenizado")
  ).connect(bankWallet);
  await realTokenizado.enableAccount(clientInfo.wallet);
  await sleep(3000);

  console.log("Granting MOVER_ROLE to client");
  await realTokenizado.grantRole(ethers.id("MOVER_ROLE"), clientInfo.wallet);
  await sleep(3000);

  console.log("Granting MOVER_ROLE to DvpEscrow");
  await realTokenizado.grantRole(
    ethers.id("MOVER_ROLE"),
    bankInfo.dvpEscrotingAddress
  );
  await sleep(3000);

  console.log("Granting MINTER_ROLE to DvpEscrow");
  await realTokenizado.grantRole(
    ethers.id("MINTER_ROLE"),
    bankInfo.dvpEscrotingAddress
  );
  await sleep(3000);

  console.log("Granting BURNER_ROLE to DvpEscrow");
  await realTokenizado.grantRole(
    ethers.id("BURNER_ROLE"),
    bankInfo.dvpEscrotingAddress
  );
  await sleep(3000);

  console.log("Enabling account for DvpEscrow");
  await realTokenizado.enableAccount(bankInfo.dvpEscrotingAddress);
  await sleep(3000);

  console.log("Enabling account for Bank");
  await realTokenizado.enableAccount(bankInfo.address);
  await sleep(3000);

  console.log("authorizeOnBankNode done...");
}

/**
 * Mints RD for a given bank.
 * This function is responsible for minting a specified amount of RD for a bank.
 * It involves checking the balance before and after minting.
 *
 * @param {BankInfo} bankInfo - The information of the bank for which RD is to be minted.
 * @param {string} amount - The amount of RD to be minted.
 */
async function mintRd(bankInfo, amount) {
  console.log("mint RD to " + bankInfo.bankName + " start...");
  // Creates a new wallet for the bank using its private key and the provider of the central bank.
  const bankWallet = new ethers.Wallet(
    bankInfo.privateKey,
    centralBankInfo.provider
  );
  // Connects to the RealDigital contract using the bank wallet.
  const realDigital = (await getContract("RealDigital", "RealDigital")).connect(
    bankWallet
  );

  // Checks the balance of the bank before minting.
  let balance = await realDigital.balanceOf(bankInfo.address);
  console.log(bankInfo.bankName + " RD pre balance", displayBalance(balance));

  // Connects to the STR contract using the bank wallet.
  const str = (await getContract("STR", "STR")).connect(bankWallet);
  let tx = await str.requestToMint(amount);
  await tx.wait();

  // Checks the balance of the bank after minting.
  balance = await realDigital.balanceOf(bankInfo.address);
  console.log(bankInfo.bankName + " RD post balance", displayBalance(balance));

  console.log("mint RD to " + bankInfo.bankName + " done...\n");
}

/**
 * Transfers RD from one bank to another.
 * This function is responsible for transferring a specified amount of RD from one bank to another.
 * It involves checking the balance before and after the transfer.
 *
 * @param {BankInfo} fromBankInfo - The information of the bank from which RD is to be transferred.
 * @param {BankInfo} toBankInfo - The information of the bank to which RD is to be transferred.
 * @param {string} amount - The amount of RD to be transferred.
 */
async function transferRd(fromBankInfo, toBankInfo, amount) {
  console.log("transfer RD start...");
  const bankWallet = new ethers.Wallet(
    fromBankInfo.privateKey,
    centralBankInfo.provider
  );
  const realDigital = (await getContract("RealDigital", "RealDigital")).connect(
    bankWallet
  );

  // Checks the balance of the bank before transfer.
  let balance = await realDigital.balanceOf(fromBankInfo.address);
  console.log("fromBank RD pre balance", displayBalance(balance));
  balance = await realDigital.safeBalanceOf(
    toBankInfo.address,
    toBankInfo.address
  );
  console.log("toBank RD pre balance", displayBalance(balance));

  // Initiates the transfer of the specified amount of RD to the recipient bank.
  let tx = await realDigital.transfer(toBankInfo.address, amount);
  await tx.wait();

  // Checks the balance of the bank after transfer.
  balance = await realDigital.balanceOf(fromBankInfo.address);
  console.log("fromBank RD post balance", displayBalance(balance));
  balance = await realDigital.safeBalanceOf(
    toBankInfo.address,
    toBankInfo.address
  );
  console.log("toBank RD post balance", displayBalance(balance));

  console.log("transfer RD done...\n");
}

/**
 * Burns RD from a bank.
 * This function is responsible for burning a specified amount of RD from a bank.
 * It involves checking the balance before and after burning.
 *
 * @param {BankInfo} bankInfo - The information of the bank from which RD is to be burned.
 * @param {string} amount - The amount of RD to be burned.
 */
async function burnRd(bankInfo, amount) {
  console.log("burn RD from bank start...");
  const bankWallet = new ethers.Wallet(
    bankInfo.privateKey,
    centralBankInfo.provider
  );
  const str = (await getContract("STR", "STR")).connect(bankWallet);
  const realDigital = (await getContract("RealDigital", "RealDigital")).connect(
    bankWallet
  );

  console.log("approving RD to STR");
  let tx = await realDigital.approve(str.target, amount);
  await tx.wait();

  // Checks the balance of the bank before burn.
  let balance = await realDigital.balanceOf(bankInfo.address);
  console.log("bank RD pre balance", displayBalance(balance));

  tx = await str.requestToBurn(amount);
  await tx.wait();

  balance = await realDigital.balanceOf(bankInfo.address);
  console.log("bank RD post balance", displayBalance(balance));

  console.log("burn RD from bank done...\n");
}

/**
 * Mints RT (Digital Value Token) for a given client.
 * This function is responsible for minting a specified amount of RT for a client.
 * It involves checking the balance before and after minting.
 *
 * @param {BankInfo} bankInfo - The information of the bank for which RT is to be minted.
 * @param {ClientInfo} clientInfo - The information of the client for whom RT is to be minted.
 * @param {string} amount - The amount of RT to be minted.
 */
async function mintRt(bankInfo, clientInfo, amount) {
  console.log("mint RT to " + clientInfo.clientName + " start...");
  const bankWallet = new ethers.Wallet(bankInfo.privateKey, bankInfo.provider);
  const realTokenizado = (
    await getContract("RealTokenizado@" + bankInfo.cnpj8, "RealTokenizado")
  ).connect(bankWallet);

  // Checks the balance of the client's wallet before minting.
  let balance = await realTokenizado.balanceOf(clientInfo.wallet);
  console.log(
    clientInfo.clientName + " RT pre balance",
    displayBalance(balance)
  );

  // Mints the specified amount of RT to the client's wallet.
  let tx = await realTokenizado.mint(clientInfo.wallet, amount);
  await tx.wait();

  // Checks the balance of the client's wallet after minting.
  balance = await realTokenizado.balanceOf(clientInfo.wallet);
  console.log(
    clientInfo.clientName + " RT post balance",
    displayBalance(balance)
  );

  console.log("mint RT to " + clientInfo.clientName + " done...\n");
}

/**
 * Transfers RT from one client to another.
 * This function is responsible for transferring a specified amount of RT from one client to another.
 * It involves checking the balance before and after the transfer.
 *
 * @param {BankInfo} bankInfo - The information of the bank for which RT is to be transferred.
 * @param {ClientInfo} fromClientInfo - The information of the client from whom RT is to be transferred.
 * @param {ClientInfo} toClientInfo - The information of the client to whom RT is to be transferred.
 * @param {string} amount - The amount of RT to be transferred.
 */
async function transferRt(bankInfo, fromClientInfo, toClientInfo, amount) {
  console.log("transfer RT start...");
  // Creates a wallet for the client initiating the transfer.
  const clientWallet = new ethers.Wallet(
    fromClientInfo.privateKey,
    bankInfo.provider
  );
  // Connects to the RealTokenizado contract using the client's wallet.
  const realTokenizado = (
    await getContract("RealTokenizado@" + bankInfo.cnpj8, "RealTokenizado")
  ).connect(clientWallet);

  // Checks the balance of the client's wallet before the transfer.
  let balance = await realTokenizado.balanceOf(fromClientInfo.wallet);
  console.log("fromClient RT pre balance", displayBalance(balance));
  balance = await realTokenizado.safeBalanceOf(
    toClientInfo.wallet,
    toClientInfo.wallet
  );
  console.log("toClient RT pre balance", displayBalance(balance));

  // Initiates the transfer of RT to the recipient client's wallet.
  let tx = await realTokenizado.transfer(toClientInfo.wallet, amount);
  await tx.wait();

  // Checks the balance of the client's wallet after the transfer.
  balance = await realTokenizado.balanceOf(fromClientInfo.wallet);
  console.log("fromClient RT post balance", displayBalance(balance));
  balance = await realTokenizado.safeBalanceOf(
    toClientInfo.wallet,
    toClientInfo.wallet
  );
  console.log("toClient RT post balance", displayBalance(balance));

  console.log("transfer RT done...\n");
}

/**
 * Burns RT from a client.
 * This function is responsible for burning a specified amount of RT from a client.
 * It involves checking the balance before and after burning.
 *
 * @param {BankInfo} bankInfo - The information of the bank for which RT is to be burned.
 * @param {ClientInfo} clientInfo - The information of the client from whom RT is to be burned.
 * @param {string} amount - The amount of RT to be burned.
 */
async function burnRt(bankInfo, clientInfo, amount) {
  console.log("burn RT from client start...");
  // Creates a wallet for the bank and the client.
  const bankWallet = new ethers.Wallet(bankInfo.privateKey, bankInfo.provider);
  const clientWallet = new ethers.Wallet(
    clientInfo.privateKey,
    bankInfo.provider
  );

  let realTokenizado = (
    await getContract("RealTokenizado@" + bankInfo.cnpj8, "RealTokenizado")
  ).connect(clientWallet);
  let tx = await realTokenizado.approve(bankWallet.address, amount);
  await tx.wait();

  // Fetches the client's balance before the burn operation.
  let balance = await realTokenizado.balanceOf(clientInfo.wallet);
  console.log("client RT pre balance", displayBalance(balance));

  console.log("burning RT");
  realTokenizado = (
    await getContract("RealTokenizado@" + bankInfo.cnpj8, "RealTokenizado")
  ).connect(bankWallet);
  tx = await realTokenizado.burnFrom(clientInfo.wallet, amount);
  await tx.wait();

  // Fetches the client's balance after the burn operation.
  balance = await realTokenizado.balanceOf(clientInfo.wallet);
  console.log("client RT post balance", displayBalance(balance));

  console.log("burn RT from client done...\n ");
}

async function clientTransferRtToExternalClient(
  fromBankInfo,
  toBankInfo,
  fromClientInfo,
  toClientInfo,
  amount
) {
  console.log("crossBankDvpTransfer start...");

  const chunkHash1 = "0x" + crypto.randomBytes(32).toString("hex");
  const chunkHash2 = "0x" + crypto.randomBytes(32).toString("hex");
  const chunkHash3 = "0x" + crypto.randomBytes(32).toString("hex");
  const bundleHash1 =
    "0x" +
    p
      .poseidon3([chunkHash1, chunkHash2, chunkHash3])
      .toString(16)
      .padStart(64, "0");
  console.log("chunkHash1", chunkHash1);
  console.log("chunkHash2", chunkHash2);
  console.log("chunkHash3", chunkHash3);
  console.log("bundleHash1", bundleHash1);
  const expire = Math.floor(Date.now() / 1000) + 60 * 120;

  // burn RT from fromClient
  const fromClientWallet = new ethers.Wallet(
    fromClientInfo.privateKey,
    fromBankInfo.provider
  );
  console.log("burn RT from fromClient...");
  let senderRealTokenizado = (
    await getContract("RealTokenizado@" + fromBankInfo.cnpj8, "RealTokenizado")
  ).connect(fromClientWallet);
  balance = await senderRealTokenizado.balanceOf(fromClientInfo.wallet);
  console.log("fromClient RT pre balance", displayBalance(balance));
  tx = await senderRealTokenizado.approve(
    fromBankInfo.dvpEscrotingAddress,
    amount
  );
  await tx.wait();
  DvpEscortingFactory = await ethers.getContractFactory("DvpEscrow");
  DvpEscorting = DvpEscortingFactory.attach(
    fromBankInfo.dvpEscrotingAddress
  ).connect(fromClientWallet);
  scheduleRequest = {
    tokenAddress: senderRealTokenizado.target,
    to: ZERO_ADDRESS,
    tokenType: 0,
    amount: amount,
    index: 0,
    chunkHash: chunkHash1,
    bundleHash: bundleHash1,
    expireTime: expire,
  };
  tx = await DvpEscorting.scheduleBurn(scheduleRequest);
  await tx.wait();

  // toBank mint RT to toClient
  console.log("toBank mint RT to toClient...");
  const toBankWallet = new ethers.Wallet(
    toBankInfo.privateKey,
    toBankInfo.provider
  );
  let receiverRealTokenizado = (
    await getContract("RealTokenizado@" + toBankInfo.cnpj8, "RealTokenizado")
  ).connect(toBankWallet);
  balance = await receiverRealTokenizado.balanceOf(toClientInfo.wallet);
  console.log(
    toClientInfo.clientName + " RT pre balance",
    displayBalance(balance)
  );
  DvpEscortingFactory = await ethers.getContractFactory("DvpEscrow");
  DvpEscorting = DvpEscortingFactory.attach(
    toBankInfo.dvpEscrotingAddress
  ).connect(toBankWallet);
  scheduleRequest = {
    tokenAddress: receiverRealTokenizado.target,
    to: toClientInfo.wallet,
    tokenType: 0,
    amount: amount,
    index: 1,
    chunkHash: chunkHash2,
    bundleHash: bundleHash1,
    expireTime: expire,
  };
  tx = await DvpEscorting.scheduleMint(scheduleRequest);
  await tx.wait();

  // fromBank transfer RD to toBank
  console.log("fromBank transfer RD to toBank...");
  const fromBankWalletAtCentralBank = new ethers.Wallet(
    fromBankInfo.privateKey,
    centralBankInfo.provider
  );
  let realDigital = (await getContract("RealDigital", "RealDigital")).connect(
    fromBankWalletAtCentralBank
  );
  balance = await realDigital.balanceOf(fromBankInfo.address);
  console.log("fromBank RD pre balance", displayBalance(balance));
  balance = await realDigital.safeBalanceOf(
    toBankInfo.address,
    toBankInfo.address
  );
  console.log("toBank RD pre balance", displayBalance(balance));
  tx = await realDigital.approve(centralBankInfo.dvpEscrotingAddress, amount);
  await tx.wait();

  DvpEscortingFactory = await ethers.getContractFactory("DvpEscrow");
  DvpEscorting = DvpEscortingFactory.attach(
    centralBankInfo.dvpEscrotingAddress
  ).connect(fromBankWalletAtCentralBank);
  scheduleRequest = {
    tokenAddress: realDigital.target,
    to: toBankInfo.address,
    tokenType: 0,
    amount: amount,
    index: 2,
    chunkHash: chunkHash3,
    bundleHash: bundleHash1,
    expireTime: expire,
  };
  tx = await DvpEscorting.scheduleTransfer(scheduleRequest);
  await tx.wait();

  // check bundle transaction
  console.log("\ncheck bundle transaction status...");
  await checkBundleTransaction(fromBankInfo.provider, bundleHash1);
  await checkBundleTransaction(toBankInfo.provider, bundleHash1);
  await checkBundleTransaction(centralBankInfo.provider, bundleHash1);

  // check post balance
  balance = await senderRealTokenizado.balanceOf(fromClientInfo.wallet);
  console.log("fromClient RT post balance", displayBalance(balance));
  balance = await receiverRealTokenizado.balanceOf(toClientInfo.wallet);
  console.log("toClient RT post balance", displayBalance(balance));
  balance = await realDigital.balanceOf(fromBankInfo.address);
  console.log("fromBank RD post balance", displayBalance(balance));
  balance = await realDigital.safeBalanceOf(
    toBankInfo.address,
    toBankInfo.address
  );
  console.log("toBank RD post balance", displayBalance(balance));

  console.log("crossBankDvpTransfer done...\n");
}

async function createTpft() {
  console.log("createTpft start...");
  let selicWallet = new ethers.Wallet(selicInfo.privateKey, selicInfo.provider);

  const tpft = (await getContract("TPFt", "TPFt")).connect(selicWallet);

  const tpftData = {
    acronym: acronym,
    code: code,
    maturityDate: maturityDate,
  };
  await tpft.createTPFt(tpftData);
  await sleep(3000);

  const id = await tpft.getTPFtId(tpftData);
  console.log("new tpft id", id);

  console.log("createTpft done...\n");
}

async function mintTpft(toBankInfo, amount) {
  console.log("mint Tpft to " + toBankInfo.bankName + " start...");
  let selicWallet = new ethers.Wallet(selicInfo.privateKey, selicInfo.provider);
  const tpft = (await getContract("TPFt", "TPFt")).connect(selicWallet);

  const tpftData = {
    acronym: acronym,
    code: code,
    maturityDate: maturityDate,
  };
  const id = await tpft.getTPFtId(tpftData);
  let balance = await tpft.balanceOf(toBankInfo.address, id);
  console.log(
    toBankInfo.bankName + " tpft pre balance",
    displayBalance(balance)
  );
  await tpft.mint(toBankInfo.address, tpftData, amount);
  await sleep(3000);
  balance = await tpft.balanceOf(toBankInfo.address, id);
  console.log(
    toBankInfo.bankName + " tpft post balance",
    displayBalance(balance)
  );

  console.log("mint Tpft to " + toBankInfo.bankName + " done...\n");
}

async function mintTpftToClient(clientInfo, amount) {
  console.log("mint Tpft to " + clientInfo.clientName + " start...\n");
  let selicWallet = new ethers.Wallet(selicInfo.privateKey, selicInfo.provider);
  const tpft = (await getContract("TPFt", "TPFt")).connect(selicWallet);

  const tpftData = {
    acronym: acronym,
    code: code,
    maturityDate: maturityDate,
  };
  const id = await tpft.getTPFtId(tpftData);
  await tpft.mint(clientInfo.wallet, tpftData, amount);
  await sleep(3000);
  const balance = await tpft.balanceOf(clientInfo.wallet, id);
  console.log(clientInfo.clientName + " tpft balance", displayBalance(balance));

  console.log("mint Tpft to " + clientInfo.clientName + " done...\n");
}

async function bankBuyTpftFromOtherBank(
  buyerBankInfo,
  sellerBankInfo,
  tpftAmount,
  unitPrice
) {
  console.log(
    buyerBankInfo.bankName +
      " buy Tpft from " +
      sellerBankInfo.bankName +
      " start..."
  );

  const operationId = generateOperationId();
  const tpftData = {
    acronym: acronym,
    code: code,
    maturityDate: maturityDate,
  };
  const realDigitalAmount = tpftAmount * unitPrice;

  // 1. sellerBank initialize 1052 trade
  console.log(sellerBankInfo.bankName + " initializing 1052 trade");
  let sellerBankWallet = new ethers.Wallet(
    sellerBankInfo.privateKey,
    selicInfo.provider
  );
  await tradeBank(
    sellerBankWallet,
    operationId,
    sellerBankInfo.address,
    buyerBankInfo.address,
    0,
    tpftData,
    tpftAmount,
    unitPrice
  );
  console.log(sellerBankInfo.bankName + " 1052 trade initialized");

  // 2. buyerBank check 1052 trade
  console.log(buyerBankInfo.bankName + " checking 1052 trade");
  let buyerBankWallet = new ethers.Wallet(
    buyerBankInfo.privateKey,
    selicInfo.provider
  );
  let isMatched = await matchOrder1052(
    operationId,
    sellerBankInfo.address,
    buyerBankInfo.address,
    1,
    tpftData,
    tpftAmount,
    unitPrice
  );
  if (isMatched) {
    console.log(buyerBankInfo.bankName + " 1052 trade check successful");
  } else {
    console.log(buyerBankInfo.bankName + " 1052 trade check failed");
    return;
  }

  // 3. money movement process
  const chunkHash1 = "0x" + crypto.randomBytes(32).toString("hex");
  const chunkHash2 = "0x" + crypto.randomBytes(32).toString("hex");
  const bundleHash =
    "0x" +
    p.poseidon3([chunkHash1, chunkHash2, 0]).toString(16).padStart(64, "0");
  console.log("chunkHash1", chunkHash1);
  console.log("chunkHash2", chunkHash2);
  console.log("bundleHash", bundleHash);
  const expire = Math.floor(Date.now() / 1000) + 60 * 120;

  // 3.1 buyerBank transfer RD to sellerBank
  console.log(
    buyerBankInfo.bankName + " transfer RD to " + sellerBankInfo.bankName
  );
  buyerBankWallet = new ethers.Wallet(
    buyerBankInfo.privateKey,
    centralBankProvider.provider
  );
  const realDigital = (await getContract("RealDigital", "RealDigital")).connect(
    buyerBankWallet
  );
  let balance = await realDigital.balanceOf(buyerBankInfo.address);
  console.log(
    buyerBankInfo.bankName + " RD pre balance",
    displayBalance(balance)
  );
  balance = await realDigital.safeBalanceOf(
    sellerBankInfo.address,
    sellerBankInfo.address
  );
  console.log(
    sellerBankInfo.bankName + " RD pre balance",
    displayBalance(balance)
  );
  let tx = await realDigital.approve(
    sellerBankInfo.dvpEscrotingAddress,
    realDigitalAmount
  );
  await tx.wait();
  let DvpEscortingFactory = await ethers.getContractFactory("DvpEscrow");
  let DvpEscorting = DvpEscortingFactory.attach(
    centralBankInfo.dvpEscrotingAddress
  ).connect(buyerBankWallet);
  let scheduleRequest = {
    tokenAddress: realDigital.target,
    to: sellerBankInfo.address,
    tokenType: 0,
    amount: realDigitalAmount,
    index: 0,
    chunkHash: chunkHash1,
    bundleHash: bundleHash,
    expireTime: expire,
  };
  tx = await DvpEscorting.scheduleTransfer(scheduleRequest);
  await tx.wait();

  // 3.2 sellerBank transfer tpft to buyerBank
  console.log(
    sellerBankInfo.bankName + " transfer tpft to " + buyerBankInfo.bankName
  );
  sellerBankWallet = new ethers.Wallet(
    sellerBankInfo.privateKey,
    selicInfo.provider
  );
  const tpft = (await getContract("TPFt", "TPFt")).connect(sellerBankWallet);
  tx = await tpft.setApprovalForAll(selicInfo.dvpEscrotingAddress, true);
  await tx.wait();
  const id = await tpft.getTPFtId(tpftData);
  console.log("tpft id", id);
  balance = await tpft.balanceOf(sellerBankInfo.address, id);
  console.log(
    sellerBankInfo.bankName + " tpft pre balance",
    displayBalance(balance)
  );
  balance = await tpft.safeBalanceOf(
    buyerBankInfo.address,
    buyerBankInfo.address,
    id
  );
  console.log(
    buyerBankInfo.bankName + " tpft pre balance",
    displayBalance(balance)
  );
  scheduleRequest = {
    tokenAddress: tpft.target,
    to: buyerBankInfo.address,
    tokenType: id,
    amount: tpftAmount,
    index: 1,
    chunkHash: chunkHash2,
    bundleHash: bundleHash,
    expireTime: expire,
  };
  DvpEscorting = DvpEscortingFactory.attach(
    selicInfo.dvpEscrotingAddress
  ).connect(sellerBankWallet);
  console.log("schedule transfer tpft...");
  tx = await DvpEscorting.scheduleTransfer1155(scheduleRequest);
  await tx.wait();
  // 3.3 check bundle transaction
  console.log("check bundle transaction status");
  await checkBundleTransaction(centralBankInfo.provider, bundleHash);
  await checkBundleTransaction(selicInfo.provider, bundleHash);
  // 3.4 check post balance
  balance = await realDigital.balanceOf(buyerBankInfo.address);
  console.log(
    buyerBankInfo.bankName + " RD post balance",
    displayBalance(balance)
  );
  balance = await realDigital.safeBalanceOf(
    sellerBankInfo.address,
    sellerBankInfo.address
  );
  console.log(
    sellerBankInfo.bankName + " RD post balance",
    displayBalance(balance)
  );
  balance = await tpft.balanceOf(sellerBankInfo.address, id);
  console.log(
    sellerBankInfo.bankName + " tpft post balance",
    displayBalance(balance)
  );
  balance = await tpft.safeBalanceOf(
    buyerBankInfo.address,
    buyerBankInfo.address,
    id
  );
  console.log(
    buyerBankInfo.bankName + " tpft post balance",
    displayBalance(balance)
  );

  // 4. buyerBank execute 1052 trade
  console.log(buyerBankInfo.bankName + " execute 1052 trade");
  buyerBankWallet = new ethers.Wallet(
    buyerBankInfo.privateKey,
    selicInfo.provider
  );
  await tradeBank(
    buyerBankWallet,
    operationId,
    sellerBankInfo.address,
    buyerBankInfo.address,
    1,
    tpftData,
    tpftAmount,
    unitPrice
  );
  await getOrder1052(operationId);
  console.log(buyerBankInfo.bankName + " 1052 trade executed");

  console.log(
    buyerBankInfo.bankName +
      " buy Tpft from " +
      sellerBankInfo.bankName +
      " done...\n"
  );
}

async function clientBuyFromInternalBank(
  bankInfo,
  clientInfo,
  tpftAmount,
  unitPrice
) {
  console.log(
    clientInfo.clientName + " buy Tpft from " + bankInfo.bankName + " start..."
  );

  const operationId = generateOperationId();
  const tpftData = {
    acronym: acronym,
    code: code,
    maturityDate: maturityDate,
  };
  const realDigitalAmount = tpftAmount * unitPrice;

  // 1. bank initialize 1052 trade
  console.log(bankInfo.bankName + " initialize 1052 trade");
  let bankWallet = new ethers.Wallet(bankInfo.privateKey, selicInfo.provider);
  let realTokenizadoContract = (
    await getContract("RealTokenizado@" + bankInfo.cnpj8, "RealTokenizado")
  ).connect(bankInfo.provider);
  await trade(
    bankWallet,
    operationId,
    bankInfo.address,
    realTokenizadoContract.target,
    clientInfo.wallet,
    realTokenizadoContract.target,
    0,
    tpftData,
    tpftAmount,
    unitPrice
  );
  console.log(bankInfo.bankName + " 1052 trade initialized");
  // 2. client check 1052 trade
  console.log(clientInfo.clientName + " check 1052 trade");
  let clientWallet = new ethers.Wallet(
    clientInfo.privateKey,
    selicInfo.provider
  );
  let isMatched = await matchOrder1052(
    operationId,
    bankInfo.address,
    clientInfo.wallet,
    1,
    tpftData,
    tpftAmount,
    unitPrice
  );
  if (isMatched) {
    console.log(clientInfo.clientName + " 1052 trade check successful");
  } else {
    console.log(clientInfo.clientName + " 1052 trade check failed");
    return;
  }
  // 3. money movement process
  const chunkHash1 = "0x" + crypto.randomBytes(32).toString("hex");
  const chunkHash2 = "0x" + crypto.randomBytes(32).toString("hex");
  const bundleHash =
    "0x" +
    p.poseidon3([chunkHash1, chunkHash2, 0]).toString(16).padStart(64, "0");
  console.log("chunkHash1", chunkHash1);
  console.log("chunkHash2", chunkHash2);
  console.log("bundleHash", bundleHash);
  const expire = Math.floor(Date.now() / 1000) + 60 * 120;

  // 3.1 client transfer RT to bank
  console.log(clientInfo.clientName + " transfer RT to " + bankInfo.bankName);
  clientWallet = new ethers.Wallet(clientInfo.privateKey, bankInfo.provider);
  const realTokenizado = (
    await getContract("RealTokenizado@" + bankInfo.cnpj8, "RealTokenizado")
  ).connect(clientWallet);
  let balance = await realTokenizado.balanceOf(clientInfo.wallet);
  console.log(
    clientInfo.clientName + " RT pre balance",
    displayBalance(balance)
  );
  balance = await realTokenizado.safeBalanceOf(
    bankInfo.address,
    bankInfo.address
  );
  console.log(bankInfo.bankName + " RT pre balance", displayBalance(balance));
  let tx = await realTokenizado.approve(
    bankInfo.dvpEscrotingAddress,
    realDigitalAmount
  );
  await tx.wait();
  let DvpEscortingFactory = await ethers.getContractFactory("DvpEscrow");
  let DvpEscorting = DvpEscortingFactory.attach(
    bankInfo.dvpEscrotingAddress
  ).connect(clientWallet);
  let scheduleRequest = {
    tokenAddress: realTokenizado.target,
    to: bank1Info.address,
    tokenType: 0,
    amount: realDigitalAmount,
    index: 0,
    chunkHash: chunkHash1,
    bundleHash: bundleHash,
    expireTime: expire,
  };
  console.log("schedule transfer RT...");
  tx = await DvpEscorting.scheduleTransfer(scheduleRequest);
  await tx.wait();
  // 3.2 bank transfer tpft to client
  console.log(bankInfo.bankName + " transfer tpft to " + clientInfo.clientName);
  bankWallet = new ethers.Wallet(bankInfo.privateKey, selicInfo.provider);
  const tpft = (await getContract("TPFt", "TPFt")).connect(bankWallet);
  tx = await tpft.setApprovalForAll(selicInfo.dvpEscrotingAddress, true);
  await tx.wait();
  const id = await tpft.getTPFtId(tpftData);
  console.log("id", id);
  balance = await tpft.balanceOf(bankInfo.address, id);
  console.log(bankInfo.bankName + " tpft pre balance", displayBalance(balance));
  balance = await tpft.safeBalanceOf(clientInfo.wallet, clientInfo.wallet, id);
  console.log(
    clientInfo.clientName + " tpft pre balance",
    displayBalance(balance)
  );
  scheduleRequest = {
    tokenAddress: tpft.target,
    to: clientInfo.wallet,
    tokenType: id,
    amount: tpftAmount,
    index: 1,
    chunkHash: chunkHash2,
    bundleHash: bundleHash,
    expireTime: expire,
  };
  DvpEscorting = DvpEscortingFactory.attach(
    selicInfo.dvpEscrotingAddress
  ).connect(bankWallet);
  console.log("schedule transfer tpft...");
  tx = await DvpEscorting.scheduleTransfer1155(scheduleRequest);
  await tx.wait();
  // 3.3 check bundle transaction
  console.log("check bundle transaction status");
  await checkBundleTransaction(bankInfo.provider, bundleHash);
  await checkBundleTransaction(selicInfo.provider, bundleHash);
  // 3.4 check post balance
  balance = await realTokenizado.balanceOf(clientInfo.wallet);
  console.log(
    clientInfo.clientName + " RT post balance",
    displayBalance(balance)
  );
  balance = await realTokenizado.safeBalanceOf(
    bankInfo.address,
    bankInfo.address
  );
  console.log(bankInfo.bankName + " RT post balance", displayBalance(balance));
  balance = await tpft.balanceOf(bankInfo.address, id);
  console.log(
    bankInfo.bankName + " tpft post balance",
    displayBalance(balance)
  );
  balance = await tpft.safeBalanceOf(clientInfo.wallet, clientInfo.wallet, id);
  console.log(
    clientInfo.clientName + " tpft post balance",
    displayBalance(balance)
  );

  // 4. client execute 1052 trade
  console.log(clientInfo.clientName + " execute 1052 trade");
  clientWallet = new ethers.Wallet(clientInfo.privateKey, selicInfo.provider);
  await trade(
    clientWallet,
    operationId,
    bankInfo.address,
    realTokenizadoContract.target,
    clientInfo.wallet,
    realTokenizadoContract.target,
    1,
    tpftData,
    tpftAmount,
    unitPrice
  );
  await getOrder1052(operationId);
  console.log(clientInfo.clientName + " 1052 trade executed");

  console.log(
    clientInfo.clientName + " buy Tpft from " + bankInfo.bankName + " done...\n"
  );
}

async function clientBuyFromExternalBank(
  buyerClientInfo,
  buyerBankInfo,
  sellerBankInfo,
  tpftAmount,
  unitPrice
) {
  console.log(
    buyerClientInfo.clientName +
      " buy Tpft from " +
      sellerBankInfo.bankName +
      " start..."
  );
  const realDigitalAmount = tpftAmount * unitPrice;
  const operationId = generateOperationId();
  const tpftData = {
    acronym: acronym,
    code: code,
    maturityDate: maturityDate,
  };

  // 1. sellerBank initialize 1052 trade
  console.log(sellerBankInfo.bankName + " initialize 1052 trade");
  let sellerBankWallet = new ethers.Wallet(
    sellerBankInfo.privateKey,
    selicInfo.provider
  );
  let senderRtToken = (
    await getContract(
      "RealTokenizado@" + sellerBankInfo.cnpj8,
      "RealTokenizado"
    )
  ).connect(sellerBankInfo.provider);
  let receiverRtToken = (
    await getContract("RealTokenizado@" + buyerBankInfo.cnpj8, "RealTokenizado")
  ).connect(buyerBankInfo.provider);
  await trade(
    sellerBankWallet,
    operationId,
    sellerBankInfo.address,
    senderRtToken.target,
    buyerClientInfo.wallet,
    receiverRtToken.target,
    0,
    tpftData,
    tpftAmount,
    unitPrice
  );
  console.log(sellerBankInfo.bankName + " 1052 trade initialized");
  // 2. buyerClient check 1052 trade
  console.log("buyerClient check 1052 trade");
  let buyerClientWallet = new ethers.Wallet(
    buyerClientInfo.privateKey,
    selicInfo.provider
  );
  let isMatched = await matchOrder1052(
    operationId,
    sellerBankInfo.address,
    buyerClientInfo.wallet,
    1,
    tpftData,
    tpftAmount,
    unitPrice
  );
  if (isMatched) {
    console.log(buyerClientInfo.clientName + " 1052 trade check successful");
  } else {
    console.log(buyerClientInfo.clientName + " 1052 trade check failed");
    return;
  }
  // 3. money movement process
  console.log("The first set of DVP transactions start...");
  const chunkHash1 = "0x" + crypto.randomBytes(32).toString("hex");
  const chunkHash2 = "0x" + crypto.randomBytes(32).toString("hex");
  const bundleHash =
    "0x" +
    p.poseidon3([chunkHash1, chunkHash2, 0]).toString(16).padStart(64, "0");
  console.log("chunkHash1", chunkHash1);
  console.log("chunkHash2", chunkHash2);
  console.log("bundleHash", bundleHash);
  const expire = Math.floor(Date.now() / 1000) + 60 * 120;
  // 3.1 buyerClient transfer RT to buyerBank
  console.log(
    buyerClientInfo.clientName + " transfer RT to " + buyerBankInfo.bankName
  );
  buyerClientWallet = new ethers.Wallet(
    buyerClientInfo.privateKey,
    buyerBankInfo.provider
  );
  let buyerRealTokenizado = (
    await getContract("RealTokenizado@" + buyerBankInfo.cnpj8, "RealTokenizado")
  ).connect(buyerClientWallet);
  let balance = await buyerRealTokenizado.balanceOf(buyerClientInfo.wallet);
  console.log(
    buyerClientInfo.clientName + " RT pre balance",
    displayBalance(balance)
  );
  balance = await buyerRealTokenizado.safeBalanceOf(
    buyerBankInfo.address,
    buyerBankInfo.address
  );
  console.log(
    buyerBankInfo.bankName + " RT pre balance",
    displayBalance(balance)
  );
  console.log("approve bank2EscrotingAddress");
  let tx = await buyerRealTokenizado.approve(
    buyerBankInfo.dvpEscrotingAddress,
    realDigitalAmount
  );
  await tx.wait();
  let DvpEscortingFactory = await ethers.getContractFactory("DvpEscrow");
  let DvpEscorting = DvpEscortingFactory.attach(
    buyerBankInfo.dvpEscrotingAddress
  ).connect(buyerClientWallet);
  let scheduleRequest = {
    tokenAddress: buyerRealTokenizado.target,
    to: buyerBankInfo.address,
    tokenType: 0,
    amount: realDigitalAmount,
    index: 0,
    chunkHash: chunkHash1,
    bundleHash: bundleHash,
    expireTime: expire,
  };
  console.log("schedule transfer RT");
  tx = await DvpEscorting.scheduleTransfer(scheduleRequest);
  await tx.wait();
  // 3.2 sellerBank transfer tpft to buyerClient
  console.log(
    sellerBankInfo.bankName + " transfer tpft to " + buyerClientInfo.clientName
  );
  sellerBankWallet = new ethers.Wallet(
    sellerBankInfo.privateKey,
    selicInfo.provider
  );
  const tpft = (await getContract("TPFt", "TPFt")).connect(sellerBankWallet);
  console.log("setApprovalForAll");
  tx = await tpft.setApprovalForAll(selicInfo.dvpEscrotingAddress, true);
  await tx.wait();
  const id = await tpft.getTPFtId(tpftData);
  console.log("tpft id", id);
  balance = await tpft.balanceOf(sellerBankInfo.address, id);
  console.log(
    sellerBankInfo.bankName + " tpft pre balance",
    displayBalance(balance)
  );
  scheduleRequest = {
    tokenAddress: tpft.target,
    to: buyerClientInfo.wallet,
    tokenType: id,
    amount: tpftAmount,
    index: 1,
    chunkHash: chunkHash2,
    bundleHash: bundleHash,
    expireTime: expire,
  };
  DvpEscorting = DvpEscortingFactory.attach(
    selicInfo.dvpEscrotingAddress
  ).connect(sellerBankWallet);
  console.log("schedule transfer tpft...");
  tx = await DvpEscorting.scheduleTransfer1155(scheduleRequest);
  await tx.wait();
  // 3.3 check bundle transaction status
  console.log("check bundle transaction status");
  await checkBundleTransaction(buyerBankInfo.provider, bundleHash);
  await checkBundleTransaction(selicInfo.provider, bundleHash);
  // 3.4 check post balance
  balance = await buyerRealTokenizado.balanceOf(buyerClientInfo.wallet);
  console.log(
    buyerClientInfo.clientName + " RT post balance",
    displayBalance(balance)
  );
  balance = await buyerRealTokenizado.safeBalanceOf(
    buyerBankInfo.address,
    buyerBankInfo.address
  );
  console.log(
    buyerBankInfo.bankName + " RT post balance",
    displayBalance(balance)
  );
  balance = await tpft.balanceOf(sellerBankInfo.address, id);
  console.log("sellerBank tpft post balance", displayBalance(balance));
  balance = await tpft.safeBalanceOf(
    buyerClientInfo.wallet,
    buyerClientInfo.wallet,
    id
  );
  console.log(
    buyerClientInfo.clientName + " tpft post balance",
    displayBalance(balance)
  );
  console.log("The first set of DVP transactions end...");
  console.log("The second set of DVP transactions start...");
  const chunkHash3 = "0x" + crypto.randomBytes(32).toString("hex");
  const chunkHash4 = "0x" + crypto.randomBytes(32).toString("hex");
  const bundleHash2 =
    "0x" +
    p.poseidon3([chunkHash3, chunkHash4, 0]).toString(16).padStart(64, "0");
  console.log("chunkHash3", chunkHash3);
  console.log("chunkHash4", chunkHash4);
  console.log("bundleHash2", bundleHash2);
  // 3.5 buyerBank burn RT
  console.log("buyerBank burn RT");
  buyerBankWallet = new ethers.Wallet(
    buyerBankInfo.privateKey,
    buyerBankInfo.provider
  );
  buyerRealTokenizado = (
    await getContract("RealTokenizado@" + buyerBankInfo.cnpj8, "RealTokenizado")
  ).connect(buyerBankWallet);
  balance = await buyerRealTokenizado.balanceOf(buyerBankInfo.address);
  console.log(
    buyerBankInfo.bankName + " RT pre balance",
    displayBalance(balance)
  );
  tx = await buyerRealTokenizado.approve(
    buyerBankInfo.dvpEscrotingAddress,
    realDigitalAmount
  );
  await tx.wait();
  DvpEscortingFactory = await ethers.getContractFactory("DvpEscrow");
  DvpEscorting = DvpEscortingFactory.attach(
    buyerBankInfo.dvpEscrotingAddress
  ).connect(buyerBankWallet);
  scheduleRequest = {
    tokenAddress: buyerRealTokenizado.target,
    to: ZERO_ADDRESS,
    tokenType: 0,
    amount: realDigitalAmount,
    index: 0,
    chunkHash: chunkHash3,
    bundleHash: bundleHash2,
    expireTime: expire,
  };
  tx = await DvpEscorting.scheduleBurn(scheduleRequest);
  await tx.wait();
  // 3.6 buyerBank transfer RD to sellerBank
  console.log("buyerBank transfer RD to sellerBank");
  buyerBankWallet = new ethers.Wallet(
    buyerBankInfo.privateKey,
    centralBankInfo.provider
  );
  realDigital = (await getContract("RealDigital", "RealDigital")).connect(
    buyerBankWallet
  );
  balance = await realDigital.balanceOf(buyerBankInfo.address);
  console.log(
    buyerBankInfo.bankName + " RD pre balance",
    displayBalance(balance)
  );
  balance = await realDigital.safeBalanceOf(
    sellerBankInfo.address,
    sellerBankInfo.address
  );
  console.log(
    sellerBankInfo.bankName + " RD pre balance",
    displayBalance(balance)
  );
  tx = await realDigital.approve(
    centralBankInfo.dvpEscrotingAddress,
    realDigitalAmount
  );
  await tx.wait();
  DvpEscortingFactory = await ethers.getContractFactory("DvpEscrow");
  DvpEscorting = DvpEscortingFactory.attach(
    centralBankInfo.dvpEscrotingAddress
  ).connect(buyerBankWallet);
  scheduleRequest = {
    tokenAddress: realDigital.target,
    to: sellerBankInfo.address,
    tokenType: 0,
    amount: realDigitalAmount,
    index: 1,
    chunkHash: chunkHash4,
    bundleHash: bundleHash2,
    expireTime: expire,
  };
  tx = await DvpEscorting.scheduleTransfer(scheduleRequest);
  await tx.wait();
  // 3.7 check bundle transaction status
  console.log("check bundle transaction status");
  await checkBundleTransaction(buyerBankInfo.provider, bundleHash2);
  await checkBundleTransaction(centralBankInfo.provider, bundleHash2);
  // 3.8 check balance
  balance = await buyerRealTokenizado.balanceOf(buyerBankInfo.address);
  console.log(
    buyerBankInfo.bankName + " RT post balance",
    displayBalance(balance)
  );
  balance = await realDigital.balanceOf(buyerBankInfo.address);
  console.log(
    buyerBankInfo.bankName + " RD post balance",
    displayBalance(balance)
  );
  balance = await realDigital.safeBalanceOf(
    sellerBankInfo.address,
    sellerBankInfo.address
  );
  console.log(
    sellerBankInfo.bankName + " RD post balance",
    displayBalance(balance)
  );
  console.log("The second set of DVP transactions end...");

  // 4. buyerClient execute 1052 trade
  console.log(buyerClientInfo.clientName + " execute 1052 trade");
  buyerClientWallet = new ethers.Wallet(
    buyerClientInfo.privateKey,
    selicInfo.provider
  );
  await trade(
    buyerClientWallet,
    operationId,
    sellerBankInfo.address,
    senderRtToken.target,
    buyerClientInfo.wallet,
    receiverRtToken.target,
    1,
    tpftData,
    tpftAmount,
    unitPrice
  );
  await getOrder1052(operationId);
  console.log(buyerClientInfo.clientName + " 1052 trade executed");

  console.log(
    buyerClientInfo.clientName +
      " buy Tpft from " +
      sellerBankInfo.bankName +
      " done...\n"
  );
}

async function clientBuyFromExternalClient(
  buyerClientInfo,
  buyerBankInfo,
  sellerClientInfo,
  sellerBankInfo,
  tpftAmount,
  unitPrice
) {
  console.log(
    "client " +
      buyerClientInfo.clientName +
      " buy Tpft from client " +
      sellerClientInfo.clientName +
      " start..."
  );

  const operationId = generateOperationId();
  const realDigitalAmount = tpftAmount * unitPrice;
  let tpftData = {
    acronym: acronym,
    code: code,
    maturityDate: maturityDate,
  };

  // 1. sellerClient initialize 1052 trade
  console.log(sellerClientInfo.clientName + " initialize 1052 trade");
  let sellerClientWallet = new ethers.Wallet(
    sellerClientInfo.privateKey,
    selicInfo.provider
  );
  let senderRtToken = (
    await getContract(
      "RealTokenizado@" + sellerBankInfo.cnpj8,
      "RealTokenizado"
    )
  ).connect(sellerBankInfo.provider);
  let receiverRtToken = (
    await getContract("RealTokenizado@" + buyerBankInfo.cnpj8, "RealTokenizado")
  ).connect(buyerBankInfo.provider);
  await trade(
    sellerClientWallet,
    operationId,
    sellerClientInfo.wallet,
    senderRtToken.target,
    buyerClientInfo.wallet,
    receiverRtToken.target,
    0,
    tpftData,
    tpftAmount,
    unitPrice
  );
  console.log(sellerClientInfo.clientName + " 1052 trade initialized");

  // 2. buyerClient check 1052 trade
  console.log(buyerClientInfo.clientName + " check 1052 trade");
  let buyerClientWallet = new ethers.Wallet(
    buyerClientInfo.privateKey,
    selicInfo.provider
  );
  let isMatched = await matchOrder1052(
    operationId,
    sellerClientInfo.wallet,
    buyerClientInfo.wallet,
    1,
    tpftData,
    tpftAmount,
    unitPrice
  );
  if (isMatched) {
    console.log(buyerClientInfo.clientName + " 1052 trade check successful");
  } else {
    console.log(buyerClientInfo.clientName + " 1052 trade check failed");
    return;
  }

  // 3. money movement process
  console.log("The first set of DVP transactions start...");
  const chunkHash1 = "0x" + crypto.randomBytes(32).toString("hex");
  const chunkHash2 = "0x" + crypto.randomBytes(32).toString("hex");
  const chunkHash3 = "0x" + crypto.randomBytes(32).toString("hex");
  const bundleHash =
    "0x" +
    p
      .poseidon3([chunkHash1, chunkHash2, chunkHash3])
      .toString(16)
      .padStart(64, "0");
  console.log("chunkHash1", chunkHash1);
  console.log("chunkHash2", chunkHash2);
  console.log("chunkHash3", chunkHash3);
  console.log("bundleHash", bundleHash);
  const expire = Math.floor(Date.now() / 1000) + 60 * 120;
  // 3.1 buyerClient transfer RT to buyerBank
  console.log(
    "client " +
      buyerClientInfo.clientName +
      " transfer RT to " +
      buyerBankInfo.bankName
  );
  buyerClientWallet = new ethers.Wallet(
    buyerClientInfo.privateKey,
    buyerBankInfo.provider
  );
  receiverRtToken = (
    await getContract("RealTokenizado@" + buyerBankInfo.cnpj8, "RealTokenizado")
  ).connect(buyerClientWallet);
  let balance = await receiverRtToken.balanceOf(buyerClientInfo.wallet);
  console.log(
    buyerClientInfo.clientName + " RT pre balance",
    displayBalance(balance)
  );
  balance = await receiverRtToken.safeBalanceOf(
    buyerBankInfo.address,
    buyerBankInfo.address
  );
  console.log(
    buyerBankInfo.bankName + " RT pre balance",
    displayBalance(balance)
  );
  console.log("approve RT to EscrotingAddress");
  let tx = await receiverRtToken.approve(
    buyerBankInfo.dvpEscrotingAddress,
    realDigitalAmount
  );
  await tx.wait();
  let DvpEscortingFactory = await ethers.getContractFactory("DvpEscrow");
  let DvpEscorting = DvpEscortingFactory.attach(
    buyerBankInfo.dvpEscrotingAddress
  ).connect(buyerClientWallet);
  let scheduleRequest = {
    tokenAddress: receiverRtToken.target,
    to: buyerBankInfo.address,
    tokenType: 0,
    amount: realDigitalAmount,
    index: 0,
    chunkHash: chunkHash1,
    bundleHash: bundleHash,
    expireTime: expire,
  };
  console.log("schedule transfer RT");
  tx = await DvpEscorting.scheduleTransfer(scheduleRequest);
  await tx.wait();
  // 3.2 sellerClient transfer tpft to buyerClient
  console.log(
    "client " +
      sellerClientInfo.clientName +
      " transfer tpft to " +
      buyerClientInfo.clientName
  );
  sellerClientWallet = new ethers.Wallet(
    sellerClientInfo.privateKey,
    selicInfo.provider
  );
  const tpft = (await getContract("TPFt", "TPFt")).connect(sellerClientWallet);
  const id = await tpft.getTPFtId(tpftData);
  console.log("setApprovalForAll");
  tx = await tpft.setApprovalForAll(selicInfo.dvpEscrotingAddress, true);
  await tx.wait();
  balance = await tpft.balanceOf(sellerClientInfo.wallet, id);
  console.log(
    "client " + sellerClientInfo.clientName + " tpft pre balance",
    displayBalance(balance)
  );
  balance = await tpft.safeBalanceOf(
    buyerClientInfo.wallet,
    buyerClientInfo.wallet,
    id
  );
  console.log(
    "client " + buyerClientInfo.clientName + " tpft pre balance",
    displayBalance(balance)
  );
  scheduleRequest = {
    tokenAddress: tpft.target,
    to: buyerClientInfo.wallet,
    tokenType: id,
    amount: tpftAmount,
    index: 1,
    chunkHash: chunkHash2,
    bundleHash: bundleHash,
    expireTime: expire,
  };
  DvpEscorting = DvpEscortingFactory.attach(
    selicInfo.dvpEscrotingAddress
  ).connect(sellerClientWallet);
  tx = await DvpEscorting.scheduleTransfer1155(scheduleRequest);
  await tx.wait();
  // 3.3 sellerBank mint RT to sellerClient
  console.log(
    sellerBankInfo.bankName + " mint RT to " + sellerClientInfo.clientName
  );
  let sellerBankWallet = new ethers.Wallet(
    sellerBankInfo.privateKey,
    sellerBankInfo.provider
  );
  senderRtToken = (
    await getContract(
      "RealTokenizado@" + sellerBankInfo.cnpj8,
      "RealTokenizado"
    )
  ).connect(sellerBankWallet);
  balance = await senderRtToken.balanceOf(sellerClientInfo.wallet);
  console.log(
    sellerClientInfo.clientName + " RT pre balance",
    displayBalance(balance)
  );
  DvpEscortingFactory = await ethers.getContractFactory("DvpEscrow");
  DvpEscorting = DvpEscortingFactory.attach(
    sellerBankInfo.dvpEscrotingAddress
  ).connect(sellerBankWallet);
  scheduleRequest = {
    tokenAddress: senderRtToken.target,
    to: sellerClientInfo.wallet,
    tokenType: 0,
    amount: realDigitalAmount,
    index: 2,
    chunkHash: chunkHash3,
    bundleHash: bundleHash,
    expireTime: expire,
  };
  tx = await DvpEscorting.scheduleMint(scheduleRequest);
  await tx.wait();
  // 3.4 check bundle transaction status
  console.log("check bundle transaction status");
  await checkBundleTransaction(buyerBankInfo.provider, bundleHash);
  await checkBundleTransaction(sellerBankInfo.provider, bundleHash);
  await checkBundleTransaction(selicInfo.provider, bundleHash);
  // 3.5 check post balance
  balance = await receiverRtToken.balanceOf(buyerClientInfo.wallet);
  console.log(
    buyerClientInfo.clientName + " RT post balance",
    displayBalance(balance)
  );
  balance = await receiverRtToken.safeBalanceOf(
    buyerBankInfo.address,
    buyerBankInfo.address
  );
  console.log(
    buyerBankInfo.bankName + " RT post balance",
    displayBalance(balance)
  );
  balance = await senderRtToken.balanceOf(sellerClientInfo.wallet);
  console.log(
    sellerClientInfo.clientName + " RT post balance",
    displayBalance(balance)
  );
  balance = await tpft.balanceOf(sellerClientInfo.wallet, id);
  console.log(
    sellerClientInfo.clientName + " tpft post balance",
    displayBalance(balance)
  );
  balance = await tpft.safeBalanceOf(
    buyerClientInfo.wallet,
    buyerClientInfo.wallet,
    id
  );
  console.log(
    buyerClientInfo.clientName + " tpft post balance",
    displayBalance(balance)
  );
  console.log("The first set of DVP transactions end...");

  console.log("The second set of DVP transactions start...");
  const chunkHash4 = "0x" + crypto.randomBytes(32).toString("hex");
  const chunkHash5 = "0x" + crypto.randomBytes(32).toString("hex");
  const bundleHash2 =
    "0x" +
    p.poseidon3([chunkHash4, chunkHash5, 0]).toString(16).padStart(64, "0");
  console.log("chunkHash4", chunkHash4);
  console.log("chunkHash5", chunkHash5);
  console.log("bundleHash2", bundleHash2);
  // 3.6 buyerBank burn RT
  console.log(buyerBankInfo.bankName + " burn RT");
  let buyerBankWallet = new ethers.Wallet(
    buyerBankInfo.privateKey,
    buyerBankInfo.provider
  );
  receiverRtToken = (
    await getContract("RealTokenizado@" + buyerBankInfo.cnpj8, "RealTokenizado")
  ).connect(buyerBankWallet);
  balance = await receiverRtToken.balanceOf(buyerBankInfo.address);
  console.log(
    buyerBankInfo.bankName + " RT pre balance",
    displayBalance(balance)
  );
  tx = await receiverRtToken.approve(
    buyerBankInfo.dvpEscrotingAddress,
    realDigitalAmount
  );
  await tx.wait();
  DvpEscortingFactory = await ethers.getContractFactory("DvpEscrow");
  DvpEscorting = DvpEscortingFactory.attach(
    buyerBankInfo.dvpEscrotingAddress
  ).connect(buyerBankWallet);
  scheduleRequest = {
    tokenAddress: receiverRtToken.target,
    to: ZERO_ADDRESS,
    tokenType: 0,
    amount: realDigitalAmount,
    index: 0,
    chunkHash: chunkHash4,
    bundleHash: bundleHash2,
    expireTime: expire,
  };
  tx = await DvpEscorting.scheduleBurn(scheduleRequest);
  await tx.wait();
  // 3.7 buyerBank transfer RD to sellerBank
  console.log(
    buyerBankInfo.bankName + " transfer RD to " + sellerBankInfo.bankName
  );
  buyerBankWallet = new ethers.Wallet(
    buyerBankInfo.privateKey,
    centralBankInfo.provider
  );
  realDigital = (await getContract("RealDigital", "RealDigital")).connect(
    buyerBankWallet
  );
  balance = await realDigital.balanceOf(buyerBankInfo.address);
  console.log(
    buyerBankInfo.bankName + " RD pre balance",
    displayBalance(balance)
  );
  balance = await realDigital.safeBalanceOf(
    sellerBankInfo.address,
    sellerBankInfo.address
  );
  console.log(
    sellerBankInfo.bankName + " RD pre balance",
    displayBalance(balance)
  );
  tx = await realDigital.approve(
    centralBankInfo.dvpEscrotingAddress,
    realDigitalAmount
  );
  await tx.wait();
  DvpEscortingFactory = await ethers.getContractFactory("DvpEscrow");
  DvpEscorting = DvpEscortingFactory.attach(
    centralBankInfo.dvpEscrotingAddress
  ).connect(buyerBankWallet);
  scheduleRequest = {
    tokenAddress: realDigital.target,
    to: sellerBankInfo.address,
    tokenType: 0,
    amount: realDigitalAmount,
    index: 1,
    chunkHash: chunkHash5,
    bundleHash: bundleHash2,
    expireTime: expire,
  };
  tx = await DvpEscorting.scheduleTransfer(scheduleRequest);
  await tx.wait();
  // 3.8 check bundle transaction status
  console.log("check bundle transaction status");
  await checkBundleTransaction(buyerBankInfo.provider, bundleHash2);
  await checkBundleTransaction(centralBankInfo.provider, bundleHash2);
  // 3.9 check post balance
  balance = await receiverRtToken.balanceOf(buyerBankInfo.address);
  console.log(
    buyerBankInfo.bankName + " RT post balance",
    displayBalance(balance)
  );
  balance = await realDigital.balanceOf(buyerBankInfo.address);
  console.log(
    buyerBankInfo.bankName + " RD post balance",
    displayBalance(balance)
  );
  balance = await realDigital.safeBalanceOf(
    sellerBankInfo.address,
    sellerBankInfo.address
  );
  console.log(
    sellerBankInfo.bankName + " RD post balance",
    displayBalance(balance)
  );
  console.log("The second set of DVP transactions end...");

  // 4. buyerClient execute 1052 trade
  console.log(buyerClientInfo.clientName + " execute 1052 trade");
  buyerClientWallet = new ethers.Wallet(
    buyerClientInfo.privateKey,
    selicInfo.provider
  );
  await trade(
    buyerClientWallet,
    operationId,
    sellerClientInfo.wallet,
    senderRtToken.target,
    buyerClientInfo.wallet,
    receiverRtToken.target,
    1,
    tpftData,
    tpftAmount,
    unitPrice
  );
  await getOrder1052(operationId);
  console.log(buyerClientInfo.clientName + " 1052 trade executed");

  console.log(
    buyerClientInfo.clientName + " buy Tpft from external client done...\n"
  );
}

async function bankBuyTpftFromCentralTreasury(
  buyerBankInfo,
  tpftAmount,
  unitPrice
) {
  console.log(
    buyerBankInfo.bankName + " buy TPFT from central treasury start..."
  );

  const operationId = generateOperationId();
  const tpftData = {
    acronym: acronym,
    code: code,
    maturityDate: maturityDate,
  };
  const expire = Math.floor(Date.now() / 1000) + 60 * 120;
  const realDigitalAmount = tpftAmount * unitPrice;
  // 1. central treasury call auctionPlacement
  console.log("Central treasury initiating auctionPlacement");
  let centralTreasuryWallet = new ethers.Wallet(
    selicInfo.privateKey,
    selicInfo.provider
  );
  await auctionPlacement(
    centralTreasuryWallet,
    operationId,
    selicInfo.cnpj8,
    buyerBankInfo.cnpj8,
    selicInfo.address,
    buyerBankInfo.address,
    0,
    tpftData,
    tpftAmount,
    unitPrice
  );
  console.log("Central treasury auctionPlacement completed");

  // 2. bank validate matchOrder
  console.log("Bank validating matchOrder");
  const bankWallet = new ethers.Wallet(
    buyerBankInfo.privateKey,
    selicInfo.provider
  );
  let isMatched = await matchOrder1002(
    operationId,
    selicInfo.address,
    buyerBankInfo.address,
    1,
    tpftData,
    tpftAmount,
    unitPrice
  );
  if (isMatched) {
    console.log("matchOrder successful");
  } else {
    console.log("matchOrder failed");
    return;
  }

  // 3. dvp process
  console.log("Money movement DVP processing");
  const chunkHash1 = "0x" + crypto.randomBytes(32).toString("hex");
  const chunkHash2 = "0x" + crypto.randomBytes(32).toString("hex");
  const bundleHash =
    "0x" +
    p.poseidon3([chunkHash1, chunkHash2, 0]).toString(16).padStart(64, "0");
  console.log("chunkHash1", chunkHash1);
  console.log("chunkHash2", chunkHash2);
  console.log("bundleHash", bundleHash);
  // 3.1 buyerBank transfer realDigital to central treasury
  console.log(
    buyerBankInfo.bankName + " transfer realDigital to central treasury"
  );
  let buyerBankWallet = new ethers.Wallet(
    buyerBankInfo.privateKey,
    centralBankInfo.provider
  );
  const realDigital = (await getContract("RealDigital", "RealDigital")).connect(
    buyerBankWallet
  );
  let balance = await realDigital.balanceOf(buyerBankInfo.address);
  console.log(
    buyerBankInfo.bankName + " realDigital pre balance",
    displayBalance(balance)
  );
  balance = await realDigital.safeBalanceOf(
    selicInfo.address,
    selicInfo.address
  );
  console.log(
    selicInfo.bankName + " realDigital pre balance",
    displayBalance(balance)
  );
  let tx = await realDigital.approve(
    centralBankInfo.dvpEscrotingAddress,
    realDigitalAmount
  );
  await tx.wait();
  DvpEscortingFactory = await ethers.getContractFactory("DvpEscrow");
  DvpEscorting = DvpEscortingFactory.attach(
    centralBankInfo.dvpEscrotingAddress
  ).connect(buyerBankWallet);
  let scheduleRequest = {
    tokenAddress: realDigital.target,
    to: selicInfo.address,
    tokenType: 0,
    amount: realDigitalAmount,
    index: 0,
    chunkHash: chunkHash1,
    bundleHash: bundleHash,
    expireTime: expire,
  };
  tx = await DvpEscorting.scheduleTransfer(scheduleRequest);
  await tx.wait();
  // 3.2 central treasury transfer TPFT to buyerBank
  console.log("central treasury transfer TPFT to " + buyerBankInfo.bankName);
  centralTreasuryWallet = new ethers.Wallet(
    selicInfo.privateKey,
    selicInfo.provider
  );
  const tpft = (await getContract("TPFt", "TPFt")).connect(
    centralTreasuryWallet
  );
  const id = await tpft.getTPFtId(tpftData);
  tx = await tpft.setApprovalForAll(selicInfo.dvpEscrotingAddress, true);
  await tx.wait();
  balance = await tpft.balanceOf(selicInfo.address, id);
  console.log(
    selicInfo.bankName + " TPFT pre balance",
    displayBalance(balance)
  );
  balance = await tpft.safeBalanceOf(
    buyerBankInfo.address,
    buyerBankInfo.address,
    id
  );
  console.log(
    buyerBankInfo.bankName + " TPFT pre balance",
    displayBalance(balance)
  );
  DvpEscortingFactory = await ethers.getContractFactory("DvpEscrow");
  DvpEscorting = DvpEscortingFactory.attach(
    selicInfo.dvpEscrotingAddress
  ).connect(centralTreasuryWallet);
  scheduleRequest = {
    tokenAddress: tpft.target,
    to: buyerBankInfo.address,
    tokenType: id,
    amount: tpftAmount,
    index: 1,
    chunkHash: chunkHash2,
    bundleHash: bundleHash,
    expireTime: expire,
  };
  tx = await DvpEscorting.scheduleTransfer1155(scheduleRequest);
  await tx.wait();

  // check bundle transaction status
  console.log("check bundle transaction status");
  await checkBundleTransaction(centralBankInfo.provider, bundleHash);
  await checkBundleTransaction(selicInfo.provider, bundleHash);

  // check post balance
  balance = await realDigital.balanceOf(buyerBankInfo.address);
  console.log(
    buyerBankInfo.bankName + " RD post balance",
    displayBalance(balance)
  );
  balance = await realDigital.safeBalanceOf(
    selicInfo.address,
    selicInfo.address
  );
  console.log(selicInfo.bankName + " RD post balance", displayBalance(balance));
  balance = await tpft.balanceOf(selicInfo.address, id);
  console.log(
    selicInfo.bankName + " TPFT post balance",
    displayBalance(balance)
  );
  balance = await tpft.safeBalanceOf(
    buyerBankInfo.address,
    buyerBankInfo.address,
    id
  );
  console.log(
    buyerBankInfo.bankName + " TPFT post balance",
    displayBalance(balance)
  );

  console.log("money movement DVP processing done...");

  // 4. buyerBank call auctionPlacement
  console.log(buyerBankInfo.bankName + " executing auctionPlacement");
  await auctionPlacement(
    bankWallet,
    operationId,
    selicInfo.cnpj8,
    buyerBankInfo.cnpj8,
    selicInfo.address,
    buyerBankInfo.address,
    1,
    tpftData,
    tpftAmount,
    unitPrice
  );
  await getOrder1002(operationId);
  console.log(buyerBankInfo.bankName + " auctionPlacement completed");

  console.log(
    buyerBankInfo.bankName + " buy TPFT from central treasury done...\n"
  );
}

async function auctionPlacement(
  wallet,
  operationId,
  cnpj8Sender,
  cnpj8Receiver,
  sender,
  receiver,
  callerPart,
  tpftData,
  tpftAmount,
  unitPrice
) {
  const tpftOperation1002 = (
    await getContract("TPFtOperation1002", "TPFtOperation1002")
  ).connect(wallet);
  let tx = await tpftOperation1002.auctionPlacement(
    operationId,
    cnpj8Sender,
    cnpj8Receiver,
    sender,
    receiver,
    callerPart,
    tpftData,
    tpftAmount,
    unitPrice
  );
  await tx.wait();
}

async function matchOrder1002(
  operationId,
  sender,
  receiver,
  callerPart,
  tpftData,
  tpftAmount,
  unitPrice
) {
  const selicWallet = new ethers.Wallet(
    selicInfo.privateKey,
    selicInfo.provider
  );
  const tpftOperation1002 = (
    await getContract("TPFtOperation1002", "TPFtOperation1002")
  ).connect(selicWallet);
  let isMatched = await tpftOperation1002.matchOrder(
    operationId,
    sender,
    receiver,
    callerPart,
    tpftData,
    tpftAmount,
    unitPrice
  );
  if (isMatched) {
    console.log("match1002Order successful");
    return true;
  } else {
    console.log("match1002Order failed");
    return false;
  }
}

async function tradeBank(
  wallet,
  operationId,
  sender,
  receiver,
  callerPart,
  tpftData,
  tpftAmount,
  unitPrice
) {
  const tpftOperation1052 = (
    await getContract("TPFtOperation1052", "TPFtOperation1052")
  ).connect(wallet);
  let tx = await tpftOperation1052.trade(
    operationId,
    sender,
    receiver,
    callerPart,
    tpftData,
    tpftAmount,
    unitPrice
  );
  await tx.wait();
}

async function trade(
  wallet,
  operationId,
  sender,
  senderToken,
  receiver,
  receiverToken,
  callerPart,
  tpftData,
  tpftAmount,
  unitPrice
) {
  const tpftOperation1052 = (
    await getContract("TPFtOperation1052", "TPFtOperation1052")
  ).connect(wallet);
  let tx = await tpftOperation1052.trade(
    operationId,
    sender,
    senderToken,
    receiver,
    receiverToken,
    callerPart,
    tpftData,
    tpftAmount,
    unitPrice
  );
  await tx.wait();
}

async function matchOrder1052(
  operationId,
  sender,
  receiver,
  callerPart,
  tpftData,
  tpftAmount,
  unitPrice
) {
  const selicWallet = new ethers.Wallet(
    selicInfo.privateKey,
    selicInfo.provider
  );
  const tpftOperation1052 = (
    await getContract("TPFtOperation1052", "TPFtOperation1052")
  ).connect(selicWallet);
  let isMatched = await tpftOperation1052.matchOrder(
    operationId,
    sender,
    receiver,
    callerPart,
    tpftData,
    tpftAmount,
    unitPrice
  );
  if (isMatched) {
    console.log("match1052Order successful");
    return true;
  } else {
    console.log("match1052Order failed");
    return false;
  }
}

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

async function executeDvp(bankInfo, bundleHash) {
  const bankWallet = new ethers.Wallet(bankInfo.privateKey, bankInfo.provider);
  DvpEscortingFactory = await ethers.getContractFactory("DvpEscrow");
  DvpEscorting = DvpEscortingFactory.attach(bank2EscrotingAddress).connect(
    bankWallet
  );
  const tx = await DvpEscorting.Transactions(bundleHash);
  console.log("tx", tx);
  let balance = await DvpEscorting.getBalance(
    "0x932fE229dc287dD52d36A508090e1d16bFf5CB64"
  );
  console.log("balance", displayBalance(balance));
  await DvpEscorting.execute(bundleHash);
  await sleep(3000);
}

async function checkBundleTransaction(bankInfo, bundleHash) {
  let BundleTransaction = await bankInfo.provider.send(
    "eth_checkTransactionBundle",
    [bundleHash]
  );
  console.log("BundleTransaction", BundleTransaction);
  let status = BundleTransaction?.Status;
  while (status !== 2) {
    console.log(
      "bundle status is not 2, continue fetch status, current status is : ",
      status
    );
    await sleep(2000);
    BundleTransaction = await bankInfo.provider.send(
      "eth_checkTransactionBundle",
      [bundleHash]
    );
    console.log("BundleTransaction", BundleTransaction);
    status = BundleTransaction?.Status;
  }
}

async function RDBalance(bankInfo) {
  const realDigital = (await getContract("RealDigital", "RealDigital")).connect(
    centralBankInfo.provider
  );
  const balance = await realDigital.safeBalanceOf(
    bankInfo.address,
    bankInfo.address
  );
  console.log(bankInfo.bankName + " realDigital balance", balance);
}

async function RTBalance(bankInfo, clientInfo) {
  const realDigital = (
    await getContract("RealTokenizado@" + bankInfo.cnpj8, "RealTokenizado")
  ).connect(bankInfo.provider);
  const balance = await realDigital.safeBalanceOf(
    clientInfo.wallet,
    clientInfo.wallet
  );
  console.log(clientInfo.clientName + " RT balance", balance);
}

async function tpftBalance(wallet) {
  let selicWallet = new ethers.Wallet(selicInfo.privateKey, selicInfo.provider);
  const tpft = (await getContract("TPFt", "TPFt")).connect(selicWallet);
  const tpftData = {
    acronym: acronym,
    code: code,
    maturityDate: maturityDate,
  };
  const id = await tpft.getTPFtId(tpftData);
  let balance = await tpft.balanceOf(wallet, id);
  console.log("tpft balance", displayBalance(balance));
}

function displayBalance(balance) {
  return (parseFloat(balance) / 100).toFixed(2);
}

function generateOperationId() {
  const date = new Date();
  const pad2 = (n) => (n < 10 ? "0" + n : n);
  const pad3 = (n) => (n < 100 ? (n < 10 ? "00" + n : "0" + n) : n);

  let operationId =
    date.getFullYear().toString() +
    pad2(date.getMonth() + 1) +
    pad2(date.getDate()) +
    pad2(date.getHours()) +
    pad2(date.getMinutes()) +
    pad2(date.getSeconds()) +
    pad3(date.getMilliseconds());
  console.log("operationId", operationId);
  return operationId;
}

async function getOrder1002(operationId) {
  let centralTreasuryWallet = new ethers.Wallet(
    selicInfo.privateKey,
    selicInfo.provider
  );
  const tpftOperation1002 = (
    await getContract("TPFtOperation1002", "TPFtOperation1002")
  ).connect(centralTreasuryWallet);
  let order = await tpftOperation1002.auctionOrders(operationId);
  console.log("order", order);
}

async function getOrder1052(operationId) {
  let centralTreasuryWallet = new ethers.Wallet(
    selicInfo.privateKey,
    selicInfo.provider
  );
  const tpftOperation1052 = (
    await getContract("TPFtOperation1052", "TPFtOperation1052")
  ).connect(centralTreasuryWallet);
  let order = await tpftOperation1052.orders(operationId);
  console.log("order", order);
}

async function deployDrex() {
  await deployOnCentralBankNode();
  await deployOnSelicNode();
  await deployOnBankNode(bank1Info);
  await deployOnBankNode(bank2Info);
  await authorizeOnCentralBankNode();
  await authorizeOnSelicNode();
  await authorizeOnBankNode(bank1Info, client1);
  await authorizeOnBankNode(bank1Info, client3);
  await authorizeOnBankNode(bank2Info, client2);
  await createTpft();
}

async function bank1TransferBank2InCentralBank() {
  await mintRd(bank1Info, 10000);
  await transferRd(bank1Info, bank2Info, 100);
  await burnRd(bank1Info, 400);
}

async function client1TransferClinet3InBank1() {
  await mintRt(bank1Info, client1, 10000);
  await transferRt(bank1Info, client1, client3, 100);
  await burnRt(bank1Info, client1, 200);
}

async function client1InBank1TransferClient2InBank2() {
  await mintRt(bank1Info, client1, 200);
  await mintRd(bank1Info, 200);
  await clientTransferRtToExternalClient(
    bank1Info,
    bank2Info,
    client1,
    client2,
    200
  );
}

async function bankBuyTpftFromOtherBankProcess() {
  let tpftAmount = 1;
  let unitPrice = 100;
  tpftAmount = tpftAmount * 100;
  const realDigitalAmount = tpftAmount * unitPrice;
  await mintRd(bank1Info, realDigitalAmount);
  await mintTpft(bank2Info, tpftAmount);
  await bankBuyTpftFromOtherBank(bank1Info, bank2Info, tpftAmount, unitPrice);
}

async function clientBuyTpftFromInternalBankProcess() {
  let realAmount = 1;
  let unitPrice = 100;
  const tpftAmount = realAmount * 100;
  const realDigitalAmount = tpftAmount * unitPrice;
  await mintTpft(bank1Info, tpftAmount);
  await mintRt(bank1Info, client1, realDigitalAmount);
  await clientBuyFromInternalBank(bank1Info, client1, tpftAmount, unitPrice);
}

async function clientBuyTpftFromExternalBankProcess() {
  let tpftAmount = 1;
  let unitPrice = 100;
  tpftAmount = tpftAmount * 100;
  const realDigitalAmount = tpftAmount * unitPrice;
  await mintTpft(bank2Info, tpftAmount);
  await mintRd(bank1Info, realDigitalAmount);
  await mintRt(bank1Info, client1, realDigitalAmount);
  await clientBuyFromExternalBank(
    client1,
    bank1Info,
    bank2Info,
    tpftAmount,
    unitPrice
  );
}

async function clientBuyTpftFromExternalClientProcess() {
  let tpftAmount = 1;
  let unitPrice = 100;
  tpftAmount = tpftAmount * 100;
  const realDigitalAmount = tpftAmount * unitPrice;
  await mintTpftToClient(client2, tpftAmount);
  await mintRd(bank1Info, realDigitalAmount);
  await mintRt(bank1Info, client1, realDigitalAmount);
  await clientBuyFromExternalClient(
    client1,
    bank1Info,
    client2,
    bank2Info,
    tpftAmount,
    unitPrice
  );
}

async function bankBuyTpftFromCentralTreasuryProcess() {
  let tpftAmount = 1;
  let unitPrice = 100;
  tpftAmount = tpftAmount * 100;
  const realDigitalAmount = tpftAmount * unitPrice;
  await mintRd(bank1Info, realDigitalAmount);
  await mintTpft(selicInfo, tpftAmount);
  await bankBuyTpftFromCentralTreasury(bank1Info, tpftAmount, unitPrice);
}

async function allCase() {
  // await deployDrex();
  await bank1TransferBank2InCentralBank();
  await client1TransferClinet3InBank1();
  await client1InBank1TransferClient2InBank2();
  await bankBuyTpftFromCentralTreasuryProcess();
  await clientBuyTpftFromInternalBankProcess();
  await clientBuyTpftFromExternalBankProcess();
  await clientBuyTpftFromExternalClientProcess();
}
//
deployDrex().then();

// getOrder1002("20241011080200357")
// getOrder1052("20241011163425962")

// bank1TransferBank2InCentralBank().then();
// client1TransferClinet3InBank1().then();

// client1InBank1TransferClient2InBank2().then(); //*** cross bank

// bankBuyTpftFromCentralTreasuryProcess().then();
// bankBuyTpftFromOtherBankProcess().then();
// clientBuyTpftFromInternalBankProcess().then();
// clientBuyTpftFromExternalBankProcess().then();
// clientBuyTpftFromExternalClientProcess().then();

// allCase().then();

// RDBalance(bank2Info).then()
// RTBalance(bank2Info, client2).then()
// tpftBalance(bank1Info.address).then()
// tpftBalance(client1Address).then();
