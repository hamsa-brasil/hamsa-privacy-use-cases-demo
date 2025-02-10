// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./RealDigital.sol";

/**
 * @title RealDigitalDefaultAccount
 * @dev Allows participants to change their default wallets.
 */
contract RealDigitalDefaultAccount is AccessControl{
    
    RealDigital private CBDC;  // Reference to the Real Digital contract for participant validation.
    address private authority; // Contract authority. Adds default wallets.
    address private admin;     // Contract administrator. Allows changing the authority.
    
    mapping(uint256 => address) private _defaultAccount; // Mapping of default accounts. The key is the participant's CNPJ8 (a Brazilian federal tax registration number).
    
    /**
     * @dev Method modifier: only participants can execute the method.
     */
    modifier onlyParticipant {
        require(CBDC.verifyAccount(msg.sender), "Must be a participant");
        _;
    }
    
    /**
     * @dev Constructor to instantiate the contract.
     * @param token Address of the Real Digital.
     * @param _authority Contract authority.
     * @param _admin Contract administrator.
     */
    constructor(RealDigital token, address _authority, address _admin) {
        CBDC = token;
        authority = _authority;
        admin = _admin;
    }
    
    /**
     * @dev Adds the first default wallet for a participant. Allowed only for the authority.
     * @param cnpj8 CNPJ8 of the participant.
     * @param wallet Participant's wallet.
     */
    function addDefaultAccount(uint256 cnpj8, address wallet) public {
        require(msg.sender == authority, "Must be the authority");
        _defaultAccount[cnpj8] = wallet;
    }
    
    /**
     * @dev Allows the participant to change their default wallet.
     * @param cnpj8 CNPJ8 of the participant.
     * @param newWallet New wallet of the participant.
     */
    function updateDefaultWallet(uint256 cnpj8, address newWallet) public onlyParticipant {
        require(_defaultAccount[cnpj8] == msg.sender, "Must be the current default account");
        _defaultAccount[cnpj8] = newWallet;
    }
    
    /**
     * @dev Returns the default account of a participant.
     * @param cnpj8 CNPJ8 of the participant.
     * @return the address of the default account.
     */
    function defaultAccount(uint256 cnpj8) public view returns (address) {
        return _defaultAccount[cnpj8];
    }
}
