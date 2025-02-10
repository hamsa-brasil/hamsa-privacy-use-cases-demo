// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract TPFtAccessControl is AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant DIRECT_PLACEMENT_ROLE =
        keccak256("DIRECT_PLACEMENT_ROLE");
    bytes32 public constant AUCTION_PLACEMENT_ROLE =
        keccak256("AUCTION_PLACEMENT_ROLE");
    bytes32 public constant FREEZER_ROLE = keccak256("FREEZER_ROLE");

    mapping(address => bool) private _enabledAddresses;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
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

    function allowTPFtMint(address member) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Must have admin role to assign minter role"
        );
        grantRole(MINTER_ROLE, member);
    }

    function allowDirectPlacement(address member) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Must have admin role to assign direct placement role"
        );
        grantRole(DIRECT_PLACEMENT_ROLE, member);
    }

    function allowAuctionPlacement(address member) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Must have admin role to assign auction placement role"
        );
        grantRole(AUCTION_PLACEMENT_ROLE, member);
    }

    function allowFreezingPlacement(address member) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Must have admin role to assign freezer role"
        );
        grantRole(FREEZER_ROLE, member);
    }

    function enableAddress(address member) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Must have admin role to enable address"
        );
        _enabledAddresses[member] = true;
    }

    function disableAddress(address member) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Must have admin role to disable address"
        );
        delete _enabledAddresses[member];
    }

    function isEnabledAddress(address member) public view returns (bool) {
        return _enabledAddresses[member];
    }
}
