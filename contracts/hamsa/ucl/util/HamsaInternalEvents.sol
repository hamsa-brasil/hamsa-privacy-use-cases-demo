pragma solidity ^0.8.0;

contract HamsaInternalEvents {
    event BundleFill(
        uint256 blockNum,
        uint256 bundleHash
    );

    event BundleExpire(
        uint256 blockNum,
        uint256 bundleHash
    );
}