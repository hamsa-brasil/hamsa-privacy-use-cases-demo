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
            url: 'http://72.152.58.172:8545',           // wlin-azure cluster
            gasPrice:0,
            accounts: [
                "32ef95df4ea8de4f6b5518106e97dbb3e5b97cdbb4a33adfeaa9f14e729f51eb",//fAdb253d9AD9b2d6D37471fA80F398f76D8347B8
                "e047c057b8b11153322c91f2d5474b73d691fa4351d053148582f07462ad1ae1",//b3C711A69B3DeAC4441904932Ca98E09e9068284
                "a8ee6be3949318b57fbdfefdc86cd3a9033b8946789cb33db209e0c623c45cb5",//8c8af239FfB9A6e93AC4b434C71a135572A1021C
                "2b42ed39b2d9c3d576320af626b90a62ce726ee0f25764061947891415dbe782",//4312488937D47A007De24d48aB82940C809EEb2b
                "35c285cae6a13a0e13ef7db25776e60b02745922da3b39513b94114c2c5d9add",//57829d5E80730D06B1364A2b05342F44bFB70E8f
                "f951e1bd9ef0359e6886ae77e5fd30d566ef098d099c78fd3fb68588657618cc",//2c44c4B96AE5f9c9dbf32cF3AA743Cd0277F3127
                "d9597e2d88463e47d1b6c2431879f06d440a6ff980a51a1f8c830623b112f329",//03d68e57f1f9939d3FDcf97B5e7a1d0Be995Ec67
                "81690fb141b4ae5682ad1fd73b29ae1bcc67891e93de73c6f636402deac21171",//93d2Ce0461C2612F847e074434d9951c32e44327
                "360b3f569579a0e824fab18c21d6e583b060e2339142c6833c899029fc8e428d",//5a3288A7400B2cd5e0568728E8216D9392094892
                "1bf1fbfb91c484e78cb8adb55ff3fee99825b49af57ba0eb0b79f82b3ffb563f",//F8041E1185C7106121952bA9914ff904A4A01c80
                "f083c679bb978f6e2eb8611de27319b2e3a329d307eb5fd1d532a1cd6b63fff9",//bA268f776F70caDB087e73020dfE41c7298363Ed
                "518eb784dd768d8c0cdf9218d44ae8f498d0cadf7ecf98f5ecf27c6b793986ca",//4568E35F2c4590Bde059be615015AaB6cc873004
            ],
        },
        server_L2_1: {
            url: 'http://64.236.63.227:8123',
            accounts: [
                "555332672ce947d150d23a36bf3847078291f89bda7073829bb718c77d626787",//0xe46Fe251dd1d9FfC247bc0DDb6D61e4EE4416ecB
                "6741001f80a9194d8d65f04d8b420940e83babc1a1dea5afa8775c395ed14ae8",//0x9E46a01F1A486095A073BFeB4B3c9e106dfB0e7E
                "7497455fe2896814aeb6e93bd7089b994936b93d50f58188b55ae494f7f20843",//0x68DCDb518402a888085C33A33345B95Ea1a5ac68
                "0740d6df0c4fb2cc880f14a72ac7118ede6d0613417ef35a92a73d9344ad0d0b",//0xa1608Fc30958cD232de765b003D4f3A4995049b6
                "c5446fda20f0b6ae6c24ababad898faa1251cc524783fabf4d84a673c41b74ef",//0x977954402132612Cc1d144E57e16eaf0E4cbcfcB
                "cf50505c2714e54cbe7f0e49a47b595ebcbb87e8cfe4ad3b285d5f0930bbaf11",//0xDeb622aA41057fFf16610651c65315DBFD569B85
                "056c8f4f176e605c2a4487962bb98f3404787cc0dab3430b2fdcc11023c170c3",//0x9AE96DC1196647A260Aa381c4c8697B5cDc8238a
                "8e086ecf667c561e568706fe33ff7c2fe5cd1edcced8c5ec737b5f9298a5585f",//0x34dbe6826DCE09f026E8D78FfD08c440b0bbcbFC
                "888ecf46b06c795e074b49e8905f437c58f203f64a52f1f87c29f0821fb6ca39",//0xFcB5c277d049cCd0f61Cd8C4736eF4F238b4f003
                "cce34f0b0f42396c20048c21763fc5ff8096f57ecf2e6f940079cc75ca25501d",//0x3669af3d2Be494b340189C565275E747a52f2044
                "ae9508cab4c2ba615dc6cf1164f4f61e53ed16c5b44fd3ee18c3dbdf90a264d2",//0xDF079155EE082010B35d209Ce01865eca29BaFbc
                "6388775b2e1059c5050aa48226d05b1a7c8d0b558a3dd31b741302538aec3c3a",//0x3A720cD05Ccca6727131cD7Cc0f1A0EEa016f9E1
            ]
        },
        server_L2_2: {
            url: 'http://72.152.53.34:8123',
            accounts: [
                "555332672ce947d150d23a36bf3847078291f89bda7073829bb718c77d626787",//0xe46Fe251dd1d9FfC247bc0DDb6D61e4EE4416ecB
                "6741001f80a9194d8d65f04d8b420940e83babc1a1dea5afa8775c395ed14ae8",//0x9E46a01F1A486095A073BFeB4B3c9e106dfB0e7E
                "7497455fe2896814aeb6e93bd7089b994936b93d50f58188b55ae494f7f20843",//0x68DCDb518402a888085C33A33345B95Ea1a5ac68
                "0740d6df0c4fb2cc880f14a72ac7118ede6d0613417ef35a92a73d9344ad0d0b",//0xa1608Fc30958cD232de765b003D4f3A4995049b6
                "c5446fda20f0b6ae6c24ababad898faa1251cc524783fabf4d84a673c41b74ef",//0x977954402132612Cc1d144E57e16eaf0E4cbcfcB
                "cf50505c2714e54cbe7f0e49a47b595ebcbb87e8cfe4ad3b285d5f0930bbaf11",//0xDeb622aA41057fFf16610651c65315DBFD569B85
                "056c8f4f176e605c2a4487962bb98f3404787cc0dab3430b2fdcc11023c170c3",//0x9AE96DC1196647A260Aa381c4c8697B5cDc8238a
                "8e086ecf667c561e568706fe33ff7c2fe5cd1edcced8c5ec737b5f9298a5585f",//0x34dbe6826DCE09f026E8D78FfD08c440b0bbcbFC
                "888ecf46b06c795e074b49e8905f437c58f203f64a52f1f87c29f0821fb6ca39",//0xFcB5c277d049cCd0f61Cd8C4736eF4F238b4f003
                "cce34f0b0f42396c20048c21763fc5ff8096f57ecf2e6f940079cc75ca25501d",//0x3669af3d2Be494b340189C565275E747a52f2044
                "ae9508cab4c2ba615dc6cf1164f4f61e53ed16c5b44fd3ee18c3dbdf90a264d2",//0xDF079155EE082010B35d209Ce01865eca29BaFbc
                "6388775b2e1059c5050aa48226d05b1a7c8d0b558a3dd31b741302538aec3c3a",//0x3A720cD05Ccca6727131cD7Cc0f1A0EEa016f9E1
            ]
        },
        server_L2_3: {
            url: 'http://72.152.53.141:8123',
            accounts: [
                "555332672ce947d150d23a36bf3847078291f89bda7073829bb718c77d626787",//0xe46Fe251dd1d9FfC247bc0DDb6D61e4EE4416ecB
                "6741001f80a9194d8d65f04d8b420940e83babc1a1dea5afa8775c395ed14ae8",//0x9E46a01F1A486095A073BFeB4B3c9e106dfB0e7E
                "7497455fe2896814aeb6e93bd7089b994936b93d50f58188b55ae494f7f20843",//0x68DCDb518402a888085C33A33345B95Ea1a5ac68
                "0740d6df0c4fb2cc880f14a72ac7118ede6d0613417ef35a92a73d9344ad0d0b",//0xa1608Fc30958cD232de765b003D4f3A4995049b6
                "c5446fda20f0b6ae6c24ababad898faa1251cc524783fabf4d84a673c41b74ef",//0x977954402132612Cc1d144E57e16eaf0E4cbcfcB
                "cf50505c2714e54cbe7f0e49a47b595ebcbb87e8cfe4ad3b285d5f0930bbaf11",//0xDeb622aA41057fFf16610651c65315DBFD569B85
                "056c8f4f176e605c2a4487962bb98f3404787cc0dab3430b2fdcc11023c170c3",//0x9AE96DC1196647A260Aa381c4c8697B5cDc8238a
                "8e086ecf667c561e568706fe33ff7c2fe5cd1edcced8c5ec737b5f9298a5585f",//0x34dbe6826DCE09f026E8D78FfD08c440b0bbcbFC
                "888ecf46b06c795e074b49e8905f437c58f203f64a52f1f87c29f0821fb6ca39",//0xFcB5c277d049cCd0f61Cd8C4736eF4F238b4f003
                "cce34f0b0f42396c20048c21763fc5ff8096f57ecf2e6f940079cc75ca25501d",//0x3669af3d2Be494b340189C565275E747a52f2044
                "ae9508cab4c2ba615dc6cf1164f4f61e53ed16c5b44fd3ee18c3dbdf90a264d2",//0xDF079155EE082010B35d209Ce01865eca29BaFbc
                "6388775b2e1059c5050aa48226d05b1a7c8d0b558a3dd31b741302538aec3c3a",//0x3A720cD05Ccca6727131cD7Cc0f1A0EEa016f9E1
            ]
        },
        server_L2_4: {
            url: 'http://72.152.52.227:8123',
            accounts: [
                "555332672ce947d150d23a36bf3847078291f89bda7073829bb718c77d626787",//0xe46Fe251dd1d9FfC247bc0DDb6D61e4EE4416ecB
                "6741001f80a9194d8d65f04d8b420940e83babc1a1dea5afa8775c395ed14ae8",//0x9E46a01F1A486095A073BFeB4B3c9e106dfB0e7E
                "7497455fe2896814aeb6e93bd7089b994936b93d50f58188b55ae494f7f20843",//0x68DCDb518402a888085C33A33345B95Ea1a5ac68
                "0740d6df0c4fb2cc880f14a72ac7118ede6d0613417ef35a92a73d9344ad0d0b",//0xa1608Fc30958cD232de765b003D4f3A4995049b6
                "c5446fda20f0b6ae6c24ababad898faa1251cc524783fabf4d84a673c41b74ef",//0x977954402132612Cc1d144E57e16eaf0E4cbcfcB
                "cf50505c2714e54cbe7f0e49a47b595ebcbb87e8cfe4ad3b285d5f0930bbaf11",//0xDeb622aA41057fFf16610651c65315DBFD569B85
                "056c8f4f176e605c2a4487962bb98f3404787cc0dab3430b2fdcc11023c170c3",//0x9AE96DC1196647A260Aa381c4c8697B5cDc8238a
                "8e086ecf667c561e568706fe33ff7c2fe5cd1edcced8c5ec737b5f9298a5585f",//0x34dbe6826DCE09f026E8D78FfD08c440b0bbcbFC
                "888ecf46b06c795e074b49e8905f437c58f203f64a52f1f87c29f0821fb6ca39",//0xFcB5c277d049cCd0f61Cd8C4736eF4F238b4f003
                "cce34f0b0f42396c20048c21763fc5ff8096f57ecf2e6f940079cc75ca25501d",//0x3669af3d2Be494b340189C565275E747a52f2044
                "ae9508cab4c2ba615dc6cf1164f4f61e53ed16c5b44fd3ee18c3dbdf90a264d2",//0xDF079155EE082010B35d209Ce01865eca29BaFbc
                "6388775b2e1059c5050aa48226d05b1a7c8d0b558a3dd31b741302538aec3c3a",//0x3A720cD05Ccca6727131cD7Cc0f1A0EEa016f9E1
            ]
        }
    },
};
