// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

/**
 * @title KeyDictionary
 * @dev Contract that represents the query of client wallets.
 */

import "./RealDigital.sol";

// 所有银行注册的客户信息
contract KeyDictionary {

    /**
     * @dev Client data.
     */
    struct CustomerData {
        uint256 taxId;      // Client's CPF (tax ID).
        uint256 bankNumber; // Participant's code.
        uint256 account;    // Client's account number.
        uint256 branch;     // Client's branch number.
        address wallet;     // Client's wallet address.
        bool registered;    // Whether registered or not.
        address owner;      // The wallet of the participant who added the client.
    }
    
    /**
     * @dev [Implementation Suggestion] Stores a request for key ownership change.
     */
    struct KeyRequest {
        bytes32 key;        // Client's key.
        uint256 timestamp;  // [Implementation Suggestion] checks the expiration time of the request.
        CustomerData data;  // The new data of the client associated with the key.
    }

    // Reference to the Digital Real contract.
    RealDigital private CBDC;

    // Mapping of client data.
    mapping(bytes32 => CustomerData) private customers;

    // Mapping of wallets.
    mapping(address => bytes32) private wallets;

    // Mapping of key ownership change requests.
    mapping(uint256 => KeyRequest) private keyRequests;

    // Event for key ownership change request.
    event KeyRequested(address owner, uint256 proposalId, bytes32 key);

    /**
     * @dev Method modifier: only participants can execute the method.
     */
    modifier onlyParticipant {
        require(CBDC.verifyAccount(msg.sender), "Must be participant");
        _;
    }

    /**
     * @dev Constructs an instance of the contract and stores the address of the Digital Real contract.
     * @param token address of the Digital Real contract.
     */
    constructor(RealDigital token) {
        CBDC = token;
    }

    /**
     * @dev Adds client data, linking it to the _key_.
     */
    function addAccount(bytes32 key, uint256 _taxId, uint256 _bankNumber, uint256 _account, uint256 _branch, address _wallet) public onlyParticipant {
        customers[key] = CustomerData(_taxId, _bankNumber, _account, _branch, _wallet, false, msg.sender);
        wallets[_wallet] = key;
    }

    /**
     * @dev Returns the client's wallet based on its _key_.
     */
    // 通过税号获取客户钱包
    function getWallet(bytes32 key) public view returns (address) {
        return customers[key].wallet;
    }

    /**
     * @dev Returns the client's key based on its wallet.
     */
    // 通过钱包获取客户key
    function getKey(address wallet) public view returns (bytes32) {
        return wallets[wallet];
    }

    /**
     * @dev Returns all client data.
     */
    function getCustomerData(bytes32 key) public view returns (CustomerData memory) {
        return customers[key];
    }

    /**
     * @dev Updates the data of the client linked to the _key_. Only the wallet owner of the participant to which the client linked his key can change the data using this function.
     */
    function updateData(bytes32 key, uint256 _taxId, uint256 _bankNumber, uint256 _account, uint256 _branch, address _wallet) public onlyParticipant {
        require(customers[key].owner == msg.sender, "Only owner can update data");
        customers[key] = CustomerData(_taxId, _bankNumber, _account, _branch, _wallet, false, msg.sender);
        wallets[_wallet] = key;
    }

    /**
     * @dev Requests a key that belongs to another participant.
     */
    function requestKey(bytes32 key, uint256 _taxId, uint256 _bankNumber, uint256 _account, uint256 _branch, address _wallet) public onlyParticipant {
        require(!customers[key].registered, "Key already registered");
        require(customers[key].owner != msg.sender, "Cannot request own key");
        // Creates a proposal for key ownership change.
        uint256 proposalId = uint256(keccak256(abi.encodePacked(msg.sender, block.timestamp)));
        // Stores the proposal.
        keyRequests[proposalId] = KeyRequest(key, block.timestamp, CustomerData(_taxId, _bankNumber, _account, _branch, _wallet, false, msg.sender));
        // Emits the key ownership change request event.
        emit KeyRequested(msg.sender, proposalId, key);
    }

    /**
     * @dev Authorizes the data change proposed by the _proposalId_ for the _key_.
     */
    function authorizeKey(uint256 proposalId, bytes32 key) public onlyParticipant {
        require(keyRequests[proposalId].key == key, "ProposalId does not match key");
        require(customers[key].owner == msg.sender, "Only owner can authorize key transfer");
        // [Implementation Suggestion] checks the expiration time of the proposal.
        require(keyRequests[proposalId].timestamp + 1 days > block.timestamp, "Proposal expired");

        // Updates the client data.
        customers[key] = keyRequests[proposalId].data;

        // Updates the wallets mapping.
        wallets[keyRequests[proposalId].data.wallet] = key;
    }
}
