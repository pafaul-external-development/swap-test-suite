const freeton = require('../../src');

const { CRYSTAL_AMOUNT, ZERO_ADDRESS } = require('../general/constants');

let swapPairConfig = {
    root: {
        initParams: {
            swapPairCode: '', // Must be not initialized code of contract
            swapPairCodeVersion: 1, // Swap pair code version
            ownerPubkey: '',
            minMessageValue: 0, // Minimal msg.value
            contractServicePayment: 0 // How much will be charged in favor of contract
        },
        constructorParams: {},
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