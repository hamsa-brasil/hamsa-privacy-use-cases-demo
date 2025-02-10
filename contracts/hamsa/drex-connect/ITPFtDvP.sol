// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IRealTokenizado.sol";

/**
 * @title ITPFtDvP
 * @dev Interface for executing Delivery versus Payment (DvP) transactions for a specific token.
 */
interface ITPFtDvP {
    /**
     * @dev Executes a DvP transaction.
     * 
     * @param sender The address of the sender (typically the one delivering the securities).
     * @param receiver The address of the receiver (typically the one making the payment).
     * @param tokenId The ID representing the specific token being transferred.
     * @param tpftAmount The amount of TPFT tokens being transferred.
     * @param unitPrice The price per unit of the token being transferred.
     * 
     * @return A boolean value indicating whether the DvP transaction was successful or not.
     */
    function executeDvP(address sender, address receiver, uint256 tokenId, uint256 tpftAmount, uint256 unitPrice) external payable returns (bool);
    function executeDvP(address sender, IRealTokenizado senderToken, address receiver, IRealTokenizado receiverToken,uint256 tokenId, uint256 tpftAmount, uint256 unitPrice) external payable returns (bool);
}