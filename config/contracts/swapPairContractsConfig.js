const { ZERO_ADDRESS } = require('../general/constants');

let swapPairConfig = {
    root: {
        initParams: {
            ownerPubkey: '',
            _randomNonce: 21 // increment after new fix
        },
        constructorParams: {
            spCode: '', // Must be not initialized code of contract
            spCodeVersion: 1, // Swap pair code version
            minMsgValue: 0, // Minimal msg.value
            contractSP: 0, // How much will be charged in favor of contract
            tip3Deployer_: ZERO_ADDRESS
        },
        keyPair: {}
    },
    pair: {
        initParams: {
            token1: '', // address of token1
            token2: '', // address of token2
            swapPairRootContract: '', // root contract that deployed swap pair
            swapPairID: '',
        },
        constructorParams: {},
        keyPair: {}
    }
}

module.exports = swapPairConfig;