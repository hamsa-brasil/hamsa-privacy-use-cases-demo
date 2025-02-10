// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AddressDiscovery.sol";
import "./ITPFt.sol";
import "./ITPFtDvP.sol";
import "./RealDigital.sol";
import "./RealTokenizado.sol";
import "./SwapOneStepFrom.sol";

contract TPFtDvP is ITPFtDvP {
    AddressDiscovery public addressDiscovery;

    constructor(address _addressDiscovery) {
        addressDiscovery = AddressDiscovery(_addressDiscovery);
    }

    function executeDvP(address sender, address receiver, uint256 tokenId, uint256 tpftAmount, uint256 unitPrice) external payable returns (bool) {
        address tpftAddress = _getAddress("TPFt");
        address realDigitalAddress = _getAddress("RealDigital");
        require(tpftAddress != address(0) && realDigitalAddress != address(0), "Contracts not found");

        RealDigital realDigital = RealDigital(realDigitalAddress);
        ITPFt tpft = ITPFt(tpftAddress);

        // Calculate the total value of the transaction
        uint256 totalValue = tpftAmount * unitPrice;

        require(realDigital.balanceOf(receiver) >= totalValue, "Insufficient RealDigital balance");

        // Check if the contract has permission to transfer tokens on behalf of the sender
        require(tpft.isApprovedForAll(sender, address(this)), "Contract not approved to transfer tokens");

        // Transfer RealDigital from the receiver to the sender
        bool success = realDigital.transferFrom(receiver, sender, totalValue);
        if (!success) {
            return false;
        }

        // Transfer the TPFt tokens from the sender to the receiver
        tpft.safeTransferFrom(sender, receiver, tokenId, tpftAmount, "");

        return true;
    }

    // 同银行：银行与客户交易
    // 跨行：银行与客户交易
    // 同银行：客户与客户交易
    // 跨行：客户与客户交易

    // 同银行：银行购买客户
    function executeDvP(address sender, IRealTokenizado senderToken, address receiver, IRealTokenizado receiverToken,uint256 tokenId, uint256 tpftAmount, uint256 unitPrice) external payable returns (bool) {
        address tpftAddress = _getAddress("TPFt");
        address realDigitalAddress = _getAddress("RealDigital");
        require(tpftAddress != address(0) && realDigitalAddress != address(0), "Contracts not found");
        
        RealDigital realDigital = RealDigital(realDigitalAddress);
        ITPFt tpft = ITPFt(tpftAddress);

        // 计算购买总金额
        uint256 totalValue = tpftAmount * unitPrice;

        // 买方银行需要余额足够
        require(receiverToken.balanceOf(receiver) >= totalValue, "Insufficient RealDigital balance");

        // 卖方tpft足够
        require(tpft.isApprovedForAll(sender, address(this)), "Contract not approved to transfer tokens");

        SwapOneStepFrom swap = new SwapOneStepFrom(realDigital);
        if (senderToken.reserve() == receiverToken.reserve()) {
            address _sender = sender;
            // 如果是同银行，则内部直接转cvt即可
            receiverToken.transferFrom(receiver, _sender, totalValue);
        }else{
            // 如果是跨行，需要销毁买家的cvt（如果买家是客户的情况下），转移买家银行的cbdc到卖家银行，再铸造cvt给买家（如果买家是客户的情况下）
            // 判断买家是否为银行
            if(!realDigital.verifyAccount(receiver)){
                receiverToken.burnFrom(receiver, totalValue);
            }
            swap.executeSwap(receiverToken.reserve(), senderToken.reserve(), totalValue);
            // 判断卖家是否为银行
            if(!realDigital.verifyAccount(sender)){
                senderToken.mint(sender, totalValue);
            }
        }
        
        // Transfer the TPFt tokens from the sender to the receiver
        tpft.safeTransferFrom(sender, receiver, tokenId, tpftAmount, "");

        return true;
    }

    function _getAddress(string memory contractName) private view returns (address) {
        return addressDiscovery.addressDiscovery(keccak256(abi.encodePacked(contractName)));
    }
}