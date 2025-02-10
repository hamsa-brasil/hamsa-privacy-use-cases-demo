// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;

import "./RealDigital.sol";

/**
 * @title STR (Reserve Transfer System)
 * @dev This contract simulates the Reserve Transfer System (STR in Portuguese). 
 * Through it, authorized participants can mint or burn Digital Real (Real Digital in Portuguese).
 * For the pilot, no validation is done, it is enough that the participant is authorized.
 */
contract STR {

    // Instance of the Real Digital contract
    RealDigital private CBDC;

    /**
     * @dev Contract constructor.
     * @param token is the instance of the Real Digital contract.
     */
    constructor(RealDigital token) {
        CBDC = token;
    }

    /**
     * @dev Modifier to restrict access only to authorized participants.
     */
    modifier onlyParticipant {
        require(CBDC.verifyAccount(msg.sender), "Must be participant");
        _;
    }

    /**
     * @dev Function to request the minting of Digital Real. 
     * Only an authorized participant can mint.
     * @param amount is the quantity of Digital Real to be minted.
     */
    function requestToMint(uint256 amount) external onlyParticipant {
        CBDC.mint(msg.sender, amount);
    }

    /**
     * @dev Function to request the burning of Digital Real. 
     * Only an authorized participant can burn.
     * @param amount is the quantity of Digital Real to be burned.
     */
    function requestToBurn(uint256 amount) external onlyParticipant {
        CBDC.burnFrom(msg.sender, amount);
    }
}
