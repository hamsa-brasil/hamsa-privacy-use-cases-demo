// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ITPFt.sol";
import "./ITPFtOperation1002.sol";

contract TPFtOperation1002 is ITPFtOperation1002 {
    mapping(uint256 => Order) public auctionOrders;

    address public centralBankAddress;

    address public tpftAddress;

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
    ) external override {
        require(
            sender == centralBankAddress,
            "Only the central bank can be the sender"
        );
        require(
            receiver != centralBankAddress,
            "Central bank cannot be the receiver"
        );
        _auction(
            operationId,
            cnpj8Sender,
            cnpj8Receiver,
            sender,
            receiver,
            callerPart,
            tpftData,
            tpftAmount,
            unitPrice
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
        Order memory order = auctionOrders[operationId];

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

    function _auction(
        uint256 operationId,
        uint256 cnpj8Sender,
        uint256 cnpj8Receiver,
        address sender,
        address receiver,
        CallerPart callerPart,
        ITPFt.TPFtData memory tpftData,
        uint256 tpftAmount,
        uint256 unitPrice
    ) internal {
        require(
            sender != address(0) && receiver != address(0),
            "Invalid sender or receiver"
        );
        require(sender != receiver, "Sender and Receiver cannot be the same");
        require(
            operationId > 0 && tpftAmount > 0 && unitPrice > 0,
            "Invalid parameters"
        );
        require(tpftAddress != address(0), "Contracts not found");
        uint256 financialValue = tpftAmount * unitPrice;
        ITPFt tpFt = ITPFt(tpftAddress);
        uint256 tokenId = tpFt.getTPFtId(tpftData);
        require(tokenId != 0, "TPFt does not exist");

        uint256 savedUnitPrice = unitPrice * 100000000;

        Order storage order = auctionOrders[operationId];
        if (order.timestamp == 0) {
            auctionOrders[operationId] = Order({
                operationId: operationId,
                sender: sender,
                receiver: receiver,
                callerPart: callerPart,
                tokenId: tokenId,
                tpftAmount: tpftAmount,
                unitPrice: savedUnitPrice,
                timestamp: block.timestamp,
                status: OperationStatus.PENDING
            });

            emit OperationEvent(
                operationId,
                cnpj8Sender,
                cnpj8Receiver,
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
            emit OperationEvent(
                operationId,
                cnpj8Sender,
                cnpj8Receiver,
                sender,
                receiver,
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
