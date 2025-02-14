require("@nomicfoundation/hardhat-toolbox");


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.25",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
                details: {
                    yulDetails: {
                        optimizerSteps: "u"
                    }
                }
            },
            "viaIR": true,
        },

    },
    ignition: {
        requiredConfirmations: 1,
    },
    allowUnlimitedContractSize: true,
    networks: {
        server_L1_besu: {
            // url: 'http://191.235.32.253:8545',     //azure environment
            url: 'http://20.51.130.255:8545',           // wlin-azure cluster
            gasPrice:0,
            accounts: [
                "32ef95df4ea8de4f6b5518106e97dbb3e5b97cdbb4a33adfeaa9f14e729f51eb",//fAdb253d9AD9b2d6D37471fA80F398f76D8347B8
                "81690fb141b4ae5682ad1fd73b29ae1bcc67891e93de73c6f636402deac21171",//93d2Ce0461C2612F847e074434d9951c32e44327
                "360b3f569579a0e824fab18c21d6e583b060e2339142c6833c899029fc8e428d",//5a3288A7400B2cd5e0568728E8216D9392094892
                "1bf1fbfb91c484e78cb8adb55ff3fee99825b49af57ba0eb0b79f82b3ffb563f",//F8041E1185C7106121952bA9914ff904A4A01c80
                "f083c679bb978f6e2eb8611de27319b2e3a329d307eb5fd1d532a1cd6b63fff9",//bA268f776F70caDB087e73020dfE41c7298363Ed
                "518eb784dd768d8c0cdf9218d44ae8f498d0cadf7ecf98f5ecf27c6b793986ca",//4568E35F2c4590Bde059be615015AaB6cc873004                
            ],
        },
        server_L2_1: {
            url: 'http://51.8.200.4:8123',
            accounts: [
                "555332672ce947d150d23a36bf3847078291f89bda7073829bb718c77d626787",//0xe46Fe251dd1d9FfC247bc0DDb6D61e4EE4416ecB
                "6741001f80a9194d8d65f04d8b420940e83babc1a1dea5afa8775c395ed14ae8",//0x9E46a01F1A486095A073BFeB4B3c9e106dfB0e7E
                "0740d6df0c4fb2cc880f14a72ac7118ede6d0613417ef35a92a73d9344ad0d0b",//0xa1608Fc30958cD232de765b003D4f3A4995049b6
                "c5446fda20f0b6ae6c24ababad898faa1251cc524783fabf4d84a673c41b74ef",//0x977954402132612Cc1d144E57e16eaf0E4cbcfcB                
            ]
        },
        server_L2_2: {
            url: 'http://4.156.34.202:8123',
            accounts: [
                "555332672ce947d150d23a36bf3847078291f89bda7073829bb718c77d626787",//0xe46Fe251dd1d9FfC247bc0DDb6D61e4EE4416ecB
                "6741001f80a9194d8d65f04d8b420940e83babc1a1dea5afa8775c395ed14ae8",//0x9E46a01F1A486095A073BFeB4B3c9e106dfB0e7E
                "0740d6df0c4fb2cc880f14a72ac7118ede6d0613417ef35a92a73d9344ad0d0b",//0xa1608Fc30958cD232de765b003D4f3A4995049b6
                "c5446fda20f0b6ae6c24ababad898faa1251cc524783fabf4d84a673c41b74ef",//0x977954402132612Cc1d144E57e16eaf0E4cbcfcB
            ]
        },
        server_L2_3: {
            url: 'http://4.157.112.6:8123',
            accounts: [
                "555332672ce947d150d23a36bf3847078291f89bda7073829bb718c77d626787",//0xe46Fe251dd1d9FfC247bc0DDb6D61e4EE4416ecB
                "6741001f80a9194d8d65f04d8b420940e83babc1a1dea5afa8775c395ed14ae8",//0x9E46a01F1A486095A073BFeB4B3c9e106dfB0e7E
                "0740d6df0c4fb2cc880f14a72ac7118ede6d0613417ef35a92a73d9344ad0d0b",//0xa1608Fc30958cD232de765b003D4f3A4995049b6
                "c5446fda20f0b6ae6c24ababad898faa1251cc524783fabf4d84a673c41b74ef",//0x977954402132612Cc1d144E57e16eaf0E4cbcfcB
            ]
        },
        server_L2_4: {
            url: 'http://135.237.111.21:8123',
            accounts: [
                "555332672ce947d150d23a36bf3847078291f89bda7073829bb718c77d626787",//0xe46Fe251dd1d9FfC247bc0DDb6D61e4EE4416ecB
                "6741001f80a9194d8d65f04d8b420940e83babc1a1dea5afa8775c395ed14ae8",//0x9E46a01F1A486095A073BFeB4B3c9e106dfB0e7E
                "0740d6df0c4fb2cc880f14a72ac7118ede6d0613417ef35a92a73d9344ad0d0b",//0xa1608Fc30958cD232de765b003D4f3A4995049b6
                "c5446fda20f0b6ae6c24ababad898faa1251cc524783fabf4d84a673c41b74ef",//0x977954402132612Cc1d144E57e16eaf0E4cbcfcB
            ]
        }
    },
};
