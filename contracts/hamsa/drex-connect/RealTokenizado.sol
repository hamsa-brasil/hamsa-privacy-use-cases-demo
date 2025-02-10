// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./RealDigital.sol";

/**
 * @title RealTokenizado (Tokenized Real)
 * @dev Implementation of the Tokenized Real contract (DVt and MEt).
 */
contract RealTokenizado is RealDigital {

    bytes32 public constant AUTHORITY_ROLE = keccak256("AUTHORITY_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant RESERVE_ROLE = keccak256("RESERVE_ROLE");

    // The name or identifier of the participant.
    string public participant;
    
    // 8-digit CNPJ (Brazilian National Registry of Legal Entities) of the institution.
    uint256 public cnpj8;
    
    // Address of the reserve, used by DvP.
    address public reserve;//在央行中的账户

    /**
     * @dev Contract constructor.
     * @param _name Name of the token.
     * @param _symbol Symbol of the token.
     * @param _authority Address of the contract authority.
     * @param _participant Identification of the participant.
     * @param _cnpj8 CNPJ of the institution.
     * @param _reserve Address of the reserve.
     */
    constructor(
        string memory _name,
        string memory _symbol,
        address _authority,
        string memory _participant,
        uint256 _cnpj8,
        address _reserve
    ) RealDigital(_name, _symbol, _authority) {
        // Setup the reserve role for the provided reserve address.
        _grantRole(RESERVE_ROLE, _reserve);

        participant = _participant;
        cnpj8 = _cnpj8;
        reserve = _reserve;
    }

    /**
     * @dev Function to update the token's reserve wallet. The reserve wallet is used by DvP (Delivery versus Payment).
     * @param newReserve Address of the new reserve.
     */
    function updateReserve(address newReserve) public whenNotPaused onlyRole(ACCESS_ROLE) {
        // Revoke the reserve role from the current reserve.
        revokeRole(RESERVE_ROLE, reserve);
        // Grant the reserve role to the new reserve.
        grantRole(RESERVE_ROLE, newReserve);
        // Update the reserve address.
        reserve = newReserve;
    }


}