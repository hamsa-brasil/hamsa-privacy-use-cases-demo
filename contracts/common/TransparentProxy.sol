pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract TransparentProxy is TransparentUpgradeableProxy, Ownable {
    constructor(
        address _logic,
        address admin,
        bytes memory _data
    ) TransparentUpgradeableProxy(_logic, admin, _data) {
        transferOwnership(admin);
    }
}
