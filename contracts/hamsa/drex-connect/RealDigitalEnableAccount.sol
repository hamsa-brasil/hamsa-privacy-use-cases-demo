// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./CBDCAccessControl.sol";

/**
 * @title RealDigitalEnableAccount
 * @dev Contract that allows a participant to enable other wallets they own.
 */
contract RealDigitalEnableAccount {
    
    CBDCAccessControl private accessControl; // Reference to the access control contract.

    /**
     * @dev Contract constructor.
     * @param accessControlAddress Address of the access control contract. The constructor creates an instance of the contract and stores this address.
     */
    constructor(address accessControlAddress) {
        accessControl = CBDCAccessControl(accessControlAddress);
    }

    /**
     * @dev Enables a new wallet for the participant. Any wallet previously enabled for the participant can enable other wallets.
     * @param member New address of the participant.
     */
    function enableAccount(address member) public {
        require(accessControl.verifyAccount(msg.sender), "Must be a participant");
        accessControl.enableAccount(member);
    }

    /**
     * @dev Disables the wallet that executed the function.
     */
    function disableAccount() public {
        require(accessControl.verifyAccount(msg.sender), "Must be a participant");
        accessControl.disableAccount(msg.sender);
    }
}
