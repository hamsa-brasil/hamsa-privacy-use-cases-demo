// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import {RealTokenizado} from "./RealTokenizado.sol";

contract RealTokenizadoFactory {
  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE"); // Role that allows pausing the contract
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE"); // Role that allows minting on token contracts
  bytes32 public constant ACCESS_ROLE = keccak256("ACCESS_ROLE"); // Role that allows enabling an address
  bytes32 public constant MOVER_ROLE = keccak256("MOVER_ROLE"); // Role that allows access to the `move` function, i.e., transfer the token from another wallet
  bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE"); // Role that allows access to the `burn` function
  bytes32 public constant FREEZER_ROLE = keccak256("FREEZER_ROLE"); // Role that allows freezing a wallet's balance, for example, for a two-step swap
  uint256 public MaxUint256 = type(uint256).max;

  event realTokenizadoCreated(address indexed tokenAddress);

  function createRealTokenizado(
    string memory _name,
    string memory _symbol,
    address _authority,
    string memory _participant,
    uint256 _cnpj8,
    address _reserve
  ) public returns (address){
    RealTokenizado newRealTokenizado = new RealTokenizado(_name, _symbol, _authority, _participant, _cnpj8, _reserve);
    emit realTokenizadoCreated(address(newRealTokenizado));
    return address(newRealTokenizado);
  }
}