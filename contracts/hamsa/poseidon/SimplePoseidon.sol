pragma solidity ^0.8.0;

import {PoseidonU2bn256Hasher} from "./PoseidonHasher.sol";

contract SimplePoseidon {
    function hash2(bytes32 input0, bytes32 input1) public pure returns (bytes32) {
        return PoseidonU2bn256Hasher.hash2(input0, input1);
    }
}