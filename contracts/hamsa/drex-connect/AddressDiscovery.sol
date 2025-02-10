// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

// Import of the OpenZeppelin access control contract
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AddressDiscovery
 * @dev Utility contract to facilitate the discovery of other contract addresses on the Piloto RD network
 */
contract AddressDiscovery is AccessControl {

    // Access role, belonging to the contract's authority.
    bytes32 public constant ACCESS_ROLE = keccak256("ACCESS_ROLE");

    // Mapping of contract addresses, the key is the keccak256 hash of the contract name.
    mapping(bytes32 => address) public addressDiscovery;

    /**
     * @dev Contract constructor
     * @param _authority address of the contract's authority, which can update contract addresses
     */
    constructor(address _authority) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ACCESS_ROLE, keccak256(abi.encodePacked(_authority)));
        _grantRole(ACCESS_ROLE, _authority);
    }

    /**
     * @dev Updates the address of a contract. Only the authority has permission for this.
     * @param smartContract keccak256 hash of the contract name
     * @param newAddress new address of the contract
     */
    function updateAddress(bytes32 smartContract, address newAddress) public onlyRole(ACCESS_ROLE) {
        // Updates the contract address
        addressDiscovery[smartContract] = newAddress;
    }
}
