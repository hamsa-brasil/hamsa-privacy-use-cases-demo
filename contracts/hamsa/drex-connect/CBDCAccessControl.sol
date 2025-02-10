// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

/*
 * @title CBDCAccessControl
 * @dev This Smart Contract is responsible for the access control layer for the Tokenized Real Digital.
 * It determines which wallets can send/receive tokens and controls the roles of which address can mint/redeem/freeze a wallet's balance.
 */
abstract contract CBDCAccessControl is AccessControl {
    // Definition of various system roles
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE"); // Role that allows pausing the contract
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE"); // Role that allows minting on token contracts
    bytes32 public constant ACCESS_ROLE = keccak256("ACCESS_ROLE"); // Role that allows enabling an address
    bytes32 public constant MOVER_ROLE = keccak256("MOVER_ROLE"); // Role that allows access to the `move` function, i.e., transfer the token from another wallet
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE"); // Role that allows access to the `burn` function
    bytes32 public constant FREEZER_ROLE = keccak256("FREEZER_ROLE"); // Role that allows freezing a wallet's balance, for example, for a two-step swap

    // Mapping to track which accounts are authorized to receive the token
    mapping(address => bool) private _authorizedAccounts;

    // Event emitted when a wallet is enabled
    event EnabledAccount(address indexed member);

    // Event emitted when a wallet is disabled
    event DisabledAccount(address indexed member);

    /*
     * @dev Contract constructor
     * @param _authority: address of the contract authority that can perform all operations with the token
     */
    constructor(address _authority) {
        address _admin = msg.sender;
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ACCESS_ROLE, _authority);
        _grantRole(MINTER_ROLE, _authority);
        _grantRole(BURNER_ROLE, _authority);
        _grantRole(MOVER_ROLE, _authority);
        _grantRole(FREEZER_ROLE, _authority);
        _grantRole(PAUSER_ROLE, _admin);

        _setRoleAdmin(ACCESS_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(MINTER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(BURNER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(MOVER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(FREEZER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(PAUSER_ROLE, DEFAULT_ADMIN_ROLE);
    }

    /*
     * @dev Modifier that checks if both the payer and the receiver are allowed to receive the token
     * @param from: address of the payer's wallet
     * @param to: address of the receiver's wallet
     */
    modifier checkAccess(address from, address to) {
        if (from != address(0) && to != address(0)) {
            require(verifyAccount(from) && verifyAccount(to), "Access denied");
        } else if (from != address(0)) {
            require(verifyAccount(from), "Access denied");
        } else if (to != address(0)) {
            require(verifyAccount(to), "Access denied");
        }
        _;
    }

    /*
     * hamsa added
     * @dev Modifier that checks if the caller can access the balance of a target address.
     * @param account The address whose balance access is being checked.
     */
    modifier checkBalanceAccess(address caller, address account) {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, caller) || caller == account,
            "Access denied"
        );
        _;
    }

    /*
     * hamsa added
     * @dev Grants the DEFAULT_ADMIN_ROLE to the specified account.
     * @param account The address to be granted the DEFAULT_ADMIN_ROLE.
     */
    function grantAdminRole(
        address account
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(DEFAULT_ADMIN_ROLE, account);
    }

    /*
     * @dev Enables a wallet to receive the token
     * @param member: address of the wallet to be enabled
     */
    function enableAccount(address member) public onlyRole(ACCESS_ROLE) {
        _authorizedAccounts[member] = true;
        emit EnabledAccount(member);
    }

    /*
     * @dev Disables a wallet from receiving the token
     * @param member: address of the wallet to be disabled
     */
    function disableAccount(address member) public onlyRole(ACCESS_ROLE) {
        _authorizedAccounts[member] = false;
        emit DisabledAccount(member);
    }

    /*
     * @dev Checks if a wallet can receive the token
     * @param account: address of the wallet to be checked
     */
    function verifyAccount(address account) public view returns (bool) {
        return _authorizedAccounts[account];
    }
}
