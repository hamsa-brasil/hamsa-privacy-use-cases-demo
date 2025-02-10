// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;

import "./RealDigital.sol";
import "./RealTokenizado.sol";

/**
 * @title SwapOneStep
 * @dev This contract implements the swap of Tokenized Real between two different participants.
 * 
 * The swap burns Tokenized Real from the paying customer, 
 * transfers Digital Real from the paying participant to the receiving participant
 * and mints Tokenized Real to the receiving customer.
 * 
 * All steps of this swap operation are done in just one transaction.
 */
contract SwapOneStepFrom {
    RealDigital private CBDC;

    event SwapExecuted(
        uint256 indexed senderNumber,
        uint256 indexed receiverNumber,
        address sender,
        address receiver,
        uint256 amount
    );

    constructor(RealDigital token) {
        CBDC = token;
    }

    // Transfers the Tokenized Real from the paying customer to the receiver.
    // The paying customer is identified by the wallet executing this function.
    function executeSwap(
        address sender,
        address receiver,
        uint256 amount
    ) public {
        // Digital Real is transferred from the paying participant to the receiver
        CBDC.move(sender, receiver, amount);
    }
}