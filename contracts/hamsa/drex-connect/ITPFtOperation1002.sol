// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ITPFt.sol";

interface ITPFtOperation1002 {
    /**
     * @dev Enum to identify the part that is transmitting the command of the operation.
     */
    enum CallerPart {
        TPFtSender,
        TPFtReceiver
    }

    /**
     * @dev Enum to identify the status of the operation.
     */
    enum OperationStatus {
        PENDING,
        SUCCESS,
        FAILED
    }

    /**
     * @dev Struct to represent an order.
     */
    struct Order {
        uint256 operationId;
        address sender;
        address receiver;
        CallerPart callerPart;
        uint256 tokenId;
        uint256 tpftAmount;
        uint256 unitPrice;
        uint256 timestamp;
        OperationStatus status;
    }

    event CommandEvent(
        uint256 operationId,
        uint256 cnpj8Sender,
        uint256 cnpj8Receiver,
        address sender,
        address receiver,
        CallerPart callerPart,
        ITPFt.TPFtData tpftData,
        uint256 tpftAmount,
        uint256 unitPrice,
        uint256 financialValue,
        string status,
        uint256 timestamp
    );

    event CommandTradeEvent(
        uint256 operationId,
        address sender,
        address receiver,
        CallerPart callerPart,
        ITPFt.TPFtData tpftData,
        uint256 tpftAmount,
        uint256 unitPrice,
        uint256 financialValue,
        string status,
        uint256 timestamp
    );

    event OperationClientTradeEvent(
        uint256 indexed operationId,
        address sender,
        address senderToken,
        address receiver,
        address receiverToken,
        ITPFt.TPFtData tpftData,
        uint256 tpftAmount,
        uint256 unitPrice,
        uint256 financialValue,
        string status,
        uint256 timestamp
    );

    event OperationEvent(
        uint256 indexed operationId,
        uint256 cnpj8Sender,
        uint256 cnpj8Receiver,
        address sender,
        address receiver,
        ITPFt.TPFtData tpftData,
        uint256 tpftAmount,
        uint256 unitPrice,
        uint256 financialValue,
        string status,
        uint256 timestamp
    );

    event OperationTradeEvent(
        uint256 indexed operationId,
        address sender,
        address receiver,
        ITPFt.TPFtData tpftData,
        uint256 tpftAmount,
        uint256 unitPrice,
        uint256 financialValue,
        string status,
        uint256 timestamp
    );

    function auctionPlacement(
        uint256 operationId,
        uint256 cnpj8Sender,
        uint256 cnpj8Receiver,
        address sender,
        address receiver,
        CallerPart callerPart,
        ITPFt.TPFtData memory tpftData,
        uint256 tpftAmount,
        uint256 unitPrice
    ) external;
}
