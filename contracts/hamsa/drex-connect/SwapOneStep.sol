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
contract SwapOneStep {
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
        RealTokenizado tokenSender,
        RealTokenizado tokenReceiver,
        address receiver,
        uint256 amount
    ) public {
        require(tokenSender.verifyAccount(msg.sender), "Sender must be participant");
        require(tokenReceiver.verifyAccount(receiver), "Receiver must be participant");
        require(tokenSender.balanceOf(msg.sender) >= amount,"Insufficient balance");

        // If it's intra-bank, just transfer value
        if (tokenSender.reserve() == tokenReceiver.reserve()) {
            tokenSender.transferFrom(msg.sender, receiver, amount);
        } else {
            // The value is taken from the payer
            tokenSender.burnFrom(msg.sender, amount);
            // Digital Real is transferred from the paying participant to the receiver
            CBDC.move(tokenSender.reserve(), tokenReceiver.reserve(), amount);
            // Tokenized Real is minted for the receiver
            tokenReceiver.mint(receiver, amount);
        }

        // Emitting the SwapExecuted event
        emit SwapExecuted(
            tokenSender.cnpj8(),
            tokenReceiver.cnpj8(),
            msg.sender,
            receiver,
            amount
        );
    }
}