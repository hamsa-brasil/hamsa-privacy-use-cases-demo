// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ITPFt.sol";
import "./ITPFtOperation1052.sol";

contract TPFtOperation1052 is ITPFtOperation1052 {
    mapping(uint256 => Order) public orders;

    address public tpftAddress;

    address public centralBankAddress;

    constructor(address _centralBankAddress) {
        centralBankAddress = _centralBankAddress;
    }

    function setTpftAddress(address _tpftAddress) external {
        require(
            msg.sender == centralBankAddress,
            "Only central bank can set TPFt address"
        );
        tpftAddress = _tpftAddress;
    }

    function trade(
        uint256 operationId,
        address sender,
        address receiver,
        CallerPart callerPart,
        ITPFt.TPFtData memory tpftData,
        uint256 tpftAmount,
        uint256 unitPrice
    ) external {
        _trade(
            operationId,
            sender,
            receiver,
            callerPart,
            tpftData,
            tpftAmount,
            unitPrice
        );
    }

    function trade(
        uint256 operationId,
        address sender,
        IRealTokenizado senderToken,
        address receiver,
        IRealTokenizado receiverToken,
        CallerPart callerPart,
        ITPFt.TPFtData memory tpftData,
        uint256 tpftAmount,
        uint256 unitPrice
    ) external {
        require(
            sender != address(0) || receiver != address(0),
            "Invalid sender or receiver"
        );
        require(sender != receiver, "Sender and Receiver cannot be the same");
        require(
            operationId > 0 && tpftAmount > 0 && unitPrice > 0,
            "Invalid parameters"
        );
        require(tpftAddress != address(0), "TPFt address not set");
        ITPFt tpFt = ITPFt(tpftAddress);
        uint256 tokenId = tpFt.getTPFtId(tpftData);
        require(tokenId != 0, "TPFt does not exist");
        uint256 financialValue = tpftAmount * unitPrice;
        _trade(
            operationId,
            sender,
            senderToken,
            receiver,
            receiverToken,
            callerPart,
            tpftData,
            tpftAmount,
            unitPrice,
            tokenId,
            financialValue
        );
    }

    function matchOrder(
        uint256 operationId,
        address sender,
        address receiver,
        CallerPart callerPart,
        ITPFt.TPFtData memory tpftData,
        uint256 tpftAmount,
        uint256 unitPrice
    ) public view returns (bool) {
        ITPFt tpFt = ITPFt(tpftAddress);
        uint256 tokenId = tpFt.getTPFtId(tpftData);
        require(tokenId != 0, "TPFt does not exist");
        Order memory order = orders[operationId];
        uint256 savedUnitPrice = unitPrice * 100000000;
        require(
            order.sender == sender &&
            order.receiver == receiver &&
            order.tokenId == tokenId &&
            order.tpftAmount == tpftAmount &&
            order.unitPrice == savedUnitPrice,
            "Order does not match"
        );
        require(
            order.callerPart != callerPart,
            "CallerPart cannot be the same"
        );
        require(
            order.status == OperationStatus.PENDING,
            "Order already executed"
        );
        return true;
    }

    function _trade(
        uint256 operationId,
        address sender,
        IRealTokenizado senderToken,
        address receiver,
        IRealTokenizado receiverToken,
        CallerPart callerPart,
        ITPFt.TPFtData memory tpftData,
        uint256 tpftAmount,
        uint256 unitPrice,
        uint256 tokenId,
        uint256 financialValue
    ) internal {
        Order storage order = orders[operationId];
        uint256 savedUnitPrice = unitPrice * 100000000;
        if (order.timestamp == 0) {
            orders[operationId] = Order(
                operationId,
                sender,
                receiver,
                callerPart,
                tokenId,
                tpftAmount,
                savedUnitPrice,
                block.timestamp,
                OperationStatus.PENDING
            );
            emit OperationClientTradeEvent(
                operationId,
                order.sender,
                senderToken,
                order.receiver,
                receiverToken,
                tpftData,
                tpftAmount,
                savedUnitPrice,
                financialValue,
                "LAN",
                block.timestamp
            );
        } else {
            require(
                order.sender == sender &&
                order.receiver == receiver &&
                order.tokenId == tokenId &&
                order.tpftAmount == tpftAmount &&
                order.unitPrice == savedUnitPrice,
                "Order does not match"
            );
            require(
                order.callerPart != callerPart,
                "CallerPart cannot be the same"
            );
            require(
                order.status == OperationStatus.PENDING,
                "Order already executed"
            );
            order.status = OperationStatus.SUCCESS;
            emit OperationClientTradeEvent(
                operationId,
                order.sender,
                senderToken,
                order.receiver,
                receiverToken,
                tpftData,
                tpftAmount,
                savedUnitPrice,
                financialValue,
                "ATU",
                block.timestamp
            );
        }
    }

    function _trade(
        uint256 operationId,
        address sender,
        address receiver,
        CallerPart callerPart,
        ITPFt.TPFtData memory tpftData,
        uint256 tpftAmount,
        uint256 unitPrice
    ) internal {
        require(
            sender != address(0) || receiver != address(0),
            "Invalid sender or receiver"
        );
        require(sender != receiver, "Sender and Receiver cannot be the same");
        require(
            operationId > 0 && tpftAmount > 0 && unitPrice > 0,
            "Invalid parameters"
        );

        require(tpftAddress != address(0), "TPFt address not set");

        uint256 financialValue = tpftAmount * unitPrice;

        ITPFt tpFt = ITPFt(tpftAddress);
        uint256 tokenId = tpFt.getTPFtId(tpftData);
        require(tokenId != 0, "TPFt does not exist");

        uint256 savedUnitPrice = unitPrice * 100000000;

        Order storage order = orders[operationId];
        if (order.timestamp == 0) {
            orders[operationId] = Order(
                operationId,
                sender,
                receiver,
                callerPart,
                tokenId,
                tpftAmount,
                savedUnitPrice,
                block.timestamp,
                OperationStatus.PENDING
            );
            emit OperationTradeEvent(
                operationId,
                sender,
                receiver,
                tpftData,
                tpftAmount,
                savedUnitPrice,
                financialValue,
                "LAN",
                block.timestamp
            );
        } else {
            require(
                order.sender == sender &&
                order.receiver == receiver &&
                order.tokenId == tokenId &&
                order.tpftAmount == tpftAmount &&
                order.unitPrice == savedUnitPrice,
                "Order does not match"
            );
            require(
                order.callerPart != callerPart,
                "CallerPart cannot be the same"
            );
            require(
                order.status == OperationStatus.PENDING,
                "Order already executed"
            );
            order.status = OperationStatus.SUCCESS;
            emit OperationTradeEvent(
                operationId,
                order.sender,
                order.receiver,
                tpftData,
                tpftAmount,
                savedUnitPrice,
                financialValue,
                "ATU",
                block.timestamp
            );
        }
    }
}
