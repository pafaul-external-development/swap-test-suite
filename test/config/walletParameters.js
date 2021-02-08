const freeton = require('../../src');
const { ZERO_ADDRESS } = require('./constants');
''

let wallet = {
    initParams: {
        tokens: 0,
        grams: freeton.utils.convertCrystal('4', 'nano'),
        wallet_public_key: "",
        owner_address: ZERO_ADDRESS,
        gas_back_address: ZERO_ADDRESS
    },
    constructorParams: {

    }
}

module.exports = wallet;