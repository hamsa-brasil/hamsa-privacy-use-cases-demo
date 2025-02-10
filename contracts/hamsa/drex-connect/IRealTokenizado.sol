// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IRealDigital} from "./IRealDigital.sol";

interface IRealTokenizado is IRealDigital{
    function reserve() external view returns (address);
}
