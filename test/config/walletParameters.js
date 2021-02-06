const freeton = require('../../src');

let wallet = {
    initParams: {
        tokens: 0,
        grams: freeton.utils.convertCrystal('4', 'nano'),
        wallet_public_key: "",
        owner_address: "0:0000000000000000000000000000000000000000000000000000000000000000",
        gas_back_address: "0:0000000000000000000000000000000000000000000000000000000000000000"
    },
    constructorParams: {

    }
}

module.exports = wallet;