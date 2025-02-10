pragma solidity ^0.8.0;

import {PoseidonHasher} from "./util/PoseidonHasher.sol";
import {PoseidonT4} from "./util/poseidonT4.sol";

contract DvpMatch  {
    struct Block {
        uint256 blockNumber;
        bytes32 blockHash;
        bytes32 l2StateRoot;
        bytes32 l2TransactionRoot;
        bytes32 l2ReceiptRoot;
    }
    struct SequencerSubmittedBlocks {
        uint256 lastBlockNum;
        mapping(uint256 => Block) submitted;
    }
    event BlockCommit(address, uint256, bytes32);
    event BundleExpire(uint256, uint);
    event BundleFill(uint256, uint);

    struct Bundle {
        uint256 blockNum;
        uint256 l1BlockNum;
        uint    expireTime;
        uint256    bundleHash;
        uint256[3] chunkHash;
        bytes32[3] transactionHash;
        bool completed;
    }

    struct BundleRequest {
        uint256 blockNum;
        bytes32 transactionHash;
        uint256 expireTime;

        //we support 3 sub-transactions at most in one bundle
        uint256 index;
        uint chunkHash;
        uint bundleHash;
    }

    mapping(address=> SequencerSubmittedBlocks) public sequencerBlocks;
    mapping(uint => Bundle) public bundleMap;
    mapping(uint => bool) public bundleExpired;
    mapping(uint => bool) public bundleFilled;

    modifier onlyBundleManager() {
        _;
    }

    function initializeGenesisState(
        bytes32 genesisStateRoot
    ) external  {
    }

    function commitBatchWithBundles(
        uint256 newBlockNumber,
        bytes32 newBlockHash,
        bytes32 newStateRoot,
        bytes32 newTransactionRoot,
        bytes32 newBundleRequestRoot,
        BundleRequest[] calldata requests
    ) external {
        //todo: bundlerequests 中的 blocknumber 和 外面的newBlockNumber是否一致
//        verifyBundleRequestRoot(newBundleRequestRoot, requests);
//        commitBlock(newBlockNumber, newBlockHash, newStateRoot, newTransactionRoot, newBundleRequestRoot);

        if (requests.length > 0) {
            for (uint i = 0; i < requests.length; i++) {
                commitBundle(requests[i]);
            }
        }
    }

//    function verifyBundleRequestRoot(
//        bytes32 bundleRequestRoot,
//        BundleRequest[] calldata requests
//    ) public pure {
//       require(requests.length>0);
//
//        bytes32 target = bytes32(requests[0].blockNum);
//        for (uint i = 0; i < requests.length; i++) {
//            bytes32 _hash = PoseidonHasher.hash2(requests[i].bundleHash, requests[i].chunkHash);
//            _hash = PoseidonHasher.hash2(_hash, requests[i].transactionHash);
//            _hash = PoseidonHasher.hash2(_hash, bytes32(requests[i].expireTime));
//
//            target = PoseidonHasher.hash2(target, _hash);
//        }
//
//        require(target == bundleRequestRoot, "NovaVerifier: receipt verify failed");
//    }

    function commitBlock(
        uint256 newBlockNum,
        bytes32 newBlockHash,
        bytes32 newStateRoot,
        bytes32 newTransactionRoot,
        bytes32 newBundleRequestRoot
    ) internal  {
        SequencerSubmittedBlocks storage sequenceBlocks = sequencerBlocks[msg.sender];
        Block storage newBlock = sequenceBlocks.submitted[newBlockNum];
        newBlock.blockNumber = newBlockNum;
        newBlock.blockHash = newBlockHash;

        newBlock.l2StateRoot = newStateRoot;
        newBlock.l2TransactionRoot = newTransactionRoot;
        newBlock.l2ReceiptRoot = newBundleRequestRoot;
        sequenceBlocks.lastBlockNum = newBlockNum;
    }

    function commitBundle(BundleRequest memory request) internal  {
        uint bundleHash = request.bundleHash;

        if (bundleExpired[bundleHash] || bundleFilled[bundleHash]) {
            return;
        }
        Bundle storage b = bundleMap[bundleHash];

        // if this is the first request
        if (b.blockNum ==0) {
            b.blockNum = request.blockNum;
            b.bundleHash = request.bundleHash;
            b.l1BlockNum =  block.number;
            b.expireTime = request.expireTime;
            b.completed = false;
            b.chunkHash[request.index] = request.chunkHash;
            return;
        }

        if (b.expireTime < block.timestamp) {
            b.completed =true;
            bundleExpired[bundleHash] =true;
            emit BundleExpire(b.blockNum, bundleHash);
            return ;
        }

        uint256 index= request.index;
        b.chunkHash[index] = request.chunkHash;
        b.transactionHash[index] = request.transactionHash;

        // if another one already exists, we just to do match
        bool matched =false;
        if (PoseidonT4.hash([b.chunkHash[0], b.chunkHash[1], b.chunkHash[2]]) == b.bundleHash) {
            matched =true;
        }

        if (matched == true ) {
            b.completed =true;
            bundleFilled[bundleHash] =true;
            emit BundleFill(b.blockNum, b.bundleHash);
        }
    }

    function getLastBlock() public view returns (uint256,  Block memory) {
        SequencerSubmittedBlocks storage blockInfo = sequencerBlocks[msg.sender];
        uint256 lastBlock = blockInfo.lastBlockNum;
        return (lastBlock, blockInfo.submitted[lastBlock]);
    }

    // this is for testing
    function hash(bytes32 a, bytes32 b) public view returns (bytes32){
        return PoseidonHasher.hash2(a, b);
    }

    function hash4(uint a, uint b, uint c) public view returns (uint){
        return PoseidonT4.hash([a, b,c]);
    }

    //this is for testing purpose
    function triggerBundleEvents(uint256 blockNum, uint bundleHash) public {
        emit BundleFill(blockNum, bundleHash);
    }

}