pragma solidity ^0.8.0;
//import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "./IDvpERC.sol";
contract DvpEscort {
    address public Admin;
    mapping(bytes32 => EscortingTx) public Transactions;
    enum EscortingType{Transfer, Burn, Mint}
    mapping(address => uint256) private balances;
    // Events
    event EscrowScheduleTransfer(address indexed from, address indexed to, uint256 value, uint256 addressBalance);
    event EscrowScheduleBurn(address indexed burner, address indexed account, uint256 value, uint256 addressBalance);
    event EscrowScheduleMint(address indexed account, address indexed minter, uint256 value, uint256 addressBalance);
    event EscrowTransfer(address indexed from, address indexed to, uint256 value,  uint256 addressBalance, address indexed tokenAddress);
    event EscrowBurn(address indexed burner, address indexed account, uint256 value, uint256 addressBalance, address indexed tokenAddress);
    event EscrowMint(address indexed account, address indexed minter, uint256 value, uint256 addressBalance, address indexed tokenAddress);
    struct EscortingTx {
        address token;
        bytes32 chunkHash;
        bytes32 bundleHash;
        EscortingType txType;
        address to;
        address from;
        uint256 amount;
        uint256 expireTime;
        bool pending;
    }
    modifier validAddress(address _address, string memory message) {
        require(_address != address(0), message);
        _;
    }
    modifier notZeroAmount(uint256 amount, string memory message) {
        require(amount>0, message);
        _;
    }
    modifier validBundleHash(bytes32 bundleHash, string memory message) {
        require(bundleHash != bytes32(0), message);
        _;
    }
    constructor() {
        Admin = msg.sender;
    }
    function scheduleTransfer(address tokenAddress, address to, uint256 amount, bytes32 chunkHash, bytes32 bundleHash, uint256 expireTime)
    validAddress(address(tokenAddress), "invalid tokenAddress is provided")
    notZeroAmount(amount, "amount must be greater than 0")
    validBundleHash(bundleHash, "bundle hash can't be 0") public returns (bool) {
        EscortingTx storage transaction = Transactions[bundleHash];
        require(transaction.amount == 0, "transaction with the same bundleHash already exists");
        ITransfer(tokenAddress).transferFrom(msg.sender, address(this), amount);
        transaction.token = tokenAddress;
        transaction.bundleHash = bundleHash;
        transaction.chunkHash = chunkHash;
        transaction.txType = EscortingType.Transfer;
        transaction.from= msg.sender;
        transaction.to = to;
        transaction.amount = amount;
        transaction.expireTime = expireTime;
        transaction.pending = true;
        uint256 balance = getBalance(address(this));
        emit EscrowScheduleTransfer(tokenAddress, address(this) , amount, balance);
        deposit(address(this), amount);
        return true;
    }
    function scheduleBurn(address tokenAddress, uint256 amount,  bytes32 chunkHash, bytes32 bundleHash, uint256 expireTime )
    validAddress(address(tokenAddress), "invalid tokenAddress is provided")
    notZeroAmount(amount, "amount must be greater than 0")
    validBundleHash(bundleHash, "bundle hash can't be 0") public returns (bool) {
        EscortingTx storage transaction = Transactions[bundleHash];
        require(transaction.amount == 0, "transaction with the same bundleHash already exists");
        ITransfer(tokenAddress).transferFrom(msg.sender, address(this), amount);
        transaction.token = tokenAddress;
        transaction.bundleHash = bundleHash;
        transaction.chunkHash = chunkHash;
        transaction.txType = EscortingType.Burn;
        transaction.from= msg.sender;
        transaction.amount = amount;
        transaction.expireTime = expireTime;
        transaction.pending = true;
        uint256 balance = getBalance(address(this));
        emit EscrowScheduleTransfer(tokenAddress, address(this) , amount, balance);
        deposit(address(this), amount);
        return true;
    }
    function scheduleMint(address tokenAddress, address to, uint256 amount,   bytes32 chunkHash, bytes32 bundleHash, uint256 expireTime)
    validAddress(address(tokenAddress), "invalid tokenAddress is provided")
    notZeroAmount(amount, "amount must be greater than 0")
    validBundleHash(bundleHash, "bundle hash can't be 0") public returns (bool) {
        EscortingTx storage transaction = Transactions[bundleHash];
        require(transaction.amount == 0, "transaction with the same bundleHash already exists");
        transaction.token = tokenAddress;
        transaction.bundleHash = bundleHash;
        transaction.chunkHash = chunkHash;
        transaction.txType = EscortingType.Mint;
        transaction.from= msg.sender;
        transaction.to = to;
        transaction.amount = amount;
        transaction.pending = true;
        transaction.expireTime = expireTime;
        uint256 balance = getBalance(address(this));
        emit EscrowScheduleMint(tokenAddress, address(this), amount, balance);
        deposit(address(this), amount);
        return true;
    }
    // return silently when transaction.pending==false
    // this is needed for compensation implementation
    // don't check expiration here. Only dvp-match should check expiration.
    // this function is only triggered by L1 event.
    function execute(bytes32 bundleHash) public {
        EscortingTx storage transaction = Transactions[bundleHash];
        if (transaction.pending == false){
            return;
        }
        if (transaction.txType == EscortingType.Transfer) {
            executeTransfer(transaction);
            transaction.pending =false;
        } else if (transaction.txType == EscortingType.Burn) {
            executeBurn(transaction);
            transaction.pending =false;
        } else if (transaction.txType == EscortingType.Mint) {
            executeMint(transaction);
            transaction.pending=false;
        }
    }
    // return silently when transaction.pending==false
    // this is needed for compensation implementation
    // this function is triggered only when timeout happens  in L1
    //
    function cancel(bytes32 bundleHash) public {
        EscortingTx storage transaction = Transactions[bundleHash];
        if (transaction.pending == false) {
            return;
        }
        if (transaction.txType == EscortingType.Transfer || transaction.txType == EscortingType.Burn) {
            returnFunding(transaction);
            transaction.pending =false;
        } else if (transaction.txType ==  EscortingType.Mint) {
            transaction.pending =false;
        }
    }
    function executeTransfer(EscortingTx memory transaction) private {
        ITransfer token =  ITransfer(transaction.token);
        token.transfer(transaction.to, transaction.amount);
        emit EscrowTransfer(address(this) , transaction.to, transaction.amount,getBalance(address(this)), transaction.token);
        withdraw(address(this), transaction.amount);
    }
    function executeBurn(EscortingTx memory transaction) private {
        IBurn token = IBurn (transaction.token);
        token.burn(transaction.amount);
        emit EscrowBurn(address(this), address(0) , transaction.amount, getBalance(transaction.token), transaction.token);
        withdraw(address(this), transaction.amount);
    }
    function executeMint(EscortingTx memory transaction) private {
        IMint token = IMint (transaction.token);
        token.mint(transaction.to, transaction.amount);
        emit EscrowMint(address(this), transaction.to , transaction.amount, getBalance(transaction.token), transaction.token);
        withdraw(address(this), transaction.amount);
    }
    function returnFunding(EscortingTx memory transaction) private {
        ITransfer token = ITransfer(transaction.token);
        token.transfer(transaction.from, transaction.amount);
    }
    function deposit(address account, uint256 amount) public payable {
        require(amount >= 0, "Must send some amount");
        balances[account] += amount;
    }
    function withdraw(address account, uint256 amount) public {
        require(amount >= 0, "Must send some amount");
        require(balances[account] >= amount, "Insufficient balance");
        balances[account] -= amount;
    }
    function getBalance(address account) public view returns (uint256) {
        return balances[account];
    }
}