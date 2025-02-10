// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;

import "./RealDigital.sol";
import "./RealTokenizado.sol";


/**
 * @title SwapTwoSteps
 * @dev This contract implements the swapping of Tokenized Real between two distinct participants.
 * The swap process burns Tokenized Real from the paying customer, transfers Digital Real from the payer to the receiver, and mints Tokenized Real for the receiver.
 * The swap operation in this contract happens in two transactions: one for proposing and another for accepting.
 */
contract SwapTwoSteps {
    RealDigital private CBDC;

    // Enumeration representing the possible statuses of a swap operation.
    enum SwapStatus {
        PENDING,   // Swap operation recorded and waiting for cancellation or execution.
        EXECUTED,  // Swap operation has been executed.
        CANCELLED  // Swap operation has been cancelled.
    }

    struct SwapProposal {
        RealTokenizado tokenSender;   // The address of the Tokenized Real contract of the payer.
        RealTokenizado tokenReceiver; // The address of the Tokenized Real contract of the receiver.
        address sender;               // The wallet address of the payer.
        address receiver;             // The wallet address of the receiver.
        uint256 amount;               // Amount of Real to be transferred.
        SwapStatus status;            // Current status of the operation.
        uint256 timestamp;            // Timestamp of the proposal creation.
    }

    uint256 private proposalCounter;
    // Mapping of swap proposals. The key is the proposal identifier.
    mapping(uint256 => SwapProposal) private swapProposals;

    event SwapStarted(
        uint256 indexed proposalId,
        uint256 indexed senderNumber,
        uint256 indexed receiverNumber,
        address sender,
        address receiver,
        uint256 amount
    );
    event SwapExecuted(
        uint256 indexed proposalId,
        uint256 indexed senderNumber,
        uint256 indexed receiverNumber,
        address sender,
        address receiver,
        uint256 amount
    );
    event SwapCancelled(uint256 indexed proposalId, string reason);
    event ExpiredProposal(uint256 indexed proposalId);

    constructor(RealDigital token) {
        CBDC = token;
        proposalCounter = 0;
    }

    // Function to initiate a swap.
    function startSwap(
        RealTokenizado tokenSender,
        RealTokenizado tokenReceiver,
        address receiver,
        uint256 amount
    ) public {
        require(tokenSender.verifyAccount(msg.sender), "Sender must be participant");
        require(tokenReceiver.verifyAccount(receiver), "Receiver must be participant");
        require(tokenSender.balanceOf(msg.sender) >= amount, "Insufficient balance");

        proposalCounter += 1;

        swapProposals[proposalCounter] = SwapProposal({
            tokenSender: tokenSender,
            tokenReceiver: tokenReceiver,
            sender: msg.sender,
            receiver: receiver,
            amount: amount,
            status: SwapStatus.PENDING,
            timestamp: block.timestamp
        });

        emit SwapStarted(
            proposalCounter,
            tokenSender.cnpj8(),
            tokenReceiver.cnpj8(),
            msg.sender,
            receiver,
            amount
        );
    }

    // Function to execute a swap based on its proposalId.
    function executeSwap(uint256 proposalId) public {
        SwapProposal storage proposal = swapProposals[proposalId];
        require(proposal.receiver == msg.sender, "Only the receiver can execute the swap.");
        require(proposal.status == SwapStatus.PENDING, "Cannot execute swap, status is not PENDING.");
        require(proposal.tokenSender.balanceOf(proposal.sender) >= proposal.amount, "Insufficient balance");

        if (proposal.tokenSender.reserve() == proposal.tokenReceiver.reserve()) {
            proposal.tokenSender.transfer(proposal.receiver, proposal.amount);
        } else {
            proposal.tokenSender.burnFrom(proposal.sender, proposal.amount);
            CBDC.move(proposal.tokenSender.reserve(), proposal.tokenReceiver.reserve(), proposal.amount);
            proposal.tokenReceiver.mint(proposal.receiver, proposal.amount);
        }

        proposal.status = SwapStatus.EXECUTED;

        emit SwapExecuted(
            proposalId,
            proposal.tokenSender.cnpj8(),
            proposal.tokenReceiver.cnpj8(),
            proposal.sender,
            proposal.receiver,
            proposal.amount
        );
    }

    // Function to cancel a swap based on its proposalId.
    function cancelSwap(uint256 proposalId, string memory reason) public {
        SwapProposal storage proposal = swapProposals[proposalId];
        require(msg.sender == proposal.sender || msg.sender == proposal.receiver, "Only the sender or receiver can cancel the swap.");
        require(proposal.status == SwapStatus.PENDING, "Cannot cancel swap, status is not PENDING.");

        proposal.status = SwapStatus.CANCELLED;
        emit SwapCancelled(proposalId, reason);
    }
}