// SPDX-License-Identifier: MIT
pragma solidity >=0.8.25;
import "../../sol/verifier.sol";
import "hardhat/console.sol";
contract RootStorage {


    mapping(uint256 => HistoryRoots) private addressMapping;
    struct HistoryRoots {
        mapping (uint256 => uint256) transactionHistory;
        mapping (uint256 => uint256) balanceHistory;
    }
    uint256 addresskey;
    uint256 txRoot;
    uint256 balanceRoot;

    mapping(uint256 => uint256) public latestBalanceRoots;

    function verify(bytes calldata data, uint256 contractAddr) public returns (Fr[] memory){
        ZKProof memory proof;
        proof.data = data;
        (uint steps, Fr[] memory z0, Fr[] memory zn) = ZkVerifier.verify(proof);
    
        storeRoots(z0, contractAddr);

        return z0;
    }

    // Function to store roots with the caller's address
    function storeRoots(Fr[] memory roots, uint256 contractAddr) internal {
        addresskey = contractAddr;

        require(roots.length == 18, "root length must equal to 18");
        //ban this code during test and debug, will release this in production
        // if (latestBalanceRoots[addresskey]!=0) {
        //     require(uint256(Fr.unwrap(roots[1]))==latestBalanceRoots[addresskey]);
        // }
        balanceRoot = uint256(Fr.unwrap(roots[17]));
        latestBalanceRoots[addresskey] = balanceRoot;
        txRoot  = uint256(Fr.unwrap(roots[0]));
         // 调试输出 txRoot 和 balanceRoot 的值
        console.log("txRoot: ", txRoot);
        console.log("balanceRoot: ", balanceRoot);
        HistoryRoots storage thisRoots = addressMapping[addresskey];
        thisRoots.transactionHistory[txRoot] = addresskey;
        for(uint i = 1;i<18;i++){
            balanceRoot = uint256(Fr.unwrap(roots[i]));
            console.log("balanceRoot at index ", i, ": ", balanceRoot);

            thisRoots.balanceHistory[balanceRoot] = addresskey;
        }
    }

    // Function to query the contract address for a given root
    function queryTxRootExist(uint256 addr,uint256 root) public view returns (uint256) {
        return addressMapping[addr].transactionHistory[root];
    }

    function queryBalanceRootExist(uint256 addr,uint256 root) public view returns (uint256) {
        return addressMapping[addr].balanceHistory[root];
    }

    function queryLatestBalanceRoot(uint256 addr) public view returns (uint256) {
        return latestBalanceRoots[addr];
    }
}
