// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

/**
 * @title ITPFt
 * @dev This interface represents the external functions of the `TPFt` contract, which is an ERC1155 token representing a tokenized Federal Public Title (TPFt).
 */
interface ITPFt is IERC1155 {

    /**
     * @dev Structure representing the data associated with a TPFt.
     */
    struct TPFtData {
        string acronym;      // Acronym for the TPFt.
        string code;         // Unique code associated with the TPFt.
        uint256 maturityDate; // Maturity date of the TPFt in timestamp format.
    }

    /**
     * @dev Event emitted when the frozen balance of an address is updated.
     * @param from Address whose frozen balance was updated.
     * @param balance The updated frozen balance.
     */
    event FrozenBalance(address indexed from, uint256 balance);

    /**
     * @dev Function to create a new TPFt.
     * @param tpftData Data associated with the TPFt to be created.
     */
    function createTPFt(TPFtData memory tpftData) external;

    /**
     * @dev Function to mint (emit) a TPFt for a specific address.
     * @param receiverAddress Address that will receive the TPFt.
     * @param tpftData Data associated with the TPFt to be minted.
     * @param tpftAmount Quantity of TPFt to be minted.
     */
    function mint(address receiverAddress, TPFtData memory tpftData, uint256 tpftAmount) external;

    /**
     * @dev Function to obtain the ID of a specific TPFt.
     * @param tpftData Data associated with the TPFt whose ID is requested.
     * @return The ID of the TPFt.
     */
    function getTPFtId(TPFtData memory tpftData) external view returns (uint256);

    /**
     * @dev Function to make a direct placement of a TPFt from one address to another.
     * @param from Origin address of the placement.
     * @param to Destination address of the placement.
     * @param tpftData Data associated with the TPFt to be placed.
     * @param tpftAmount Quantity of TPFt to be placed.
     */
    function directPlacement(address from, address to, TPFtData memory tpftData, uint256 tpftAmount) external;

    /**
     * @dev Function to increase the frozen balance of an address.
     * @param from Address whose balance will be frozen.
     * @param tpftData Data associated with the TPFt to be frozen.
     * @param tpftAmount Quantity of TPFt to be frozen.
     */
    function increaseFrozenBalance(address from, TPFtData memory tpftData, uint256 tpftAmount) external;

    /**
     * @dev Function to decrease the frozen balance of an address.
     * @param from Address whose balance will be unfrozen.
     * @param tpftData Data associated with the TPFt to be unfrozen.
     * @param tpftAmount Quantity of TPFt to be unfrozen.
     */
    function decreaseFrozenBalance(address from, TPFtData memory tpftData, uint256 tpftAmount) external;

    /**
     * @dev Function to pause all contract operations.
     */
    function pause() external;

    /**
     * @dev Function to resume all contract operations after being paused.
     */
    function unpause() external;
}
