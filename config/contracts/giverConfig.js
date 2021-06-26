/**
 * @typedef Giver
 * @type {Object}
 * 
 * @param {Object} abi
 * @param {String} address
 * @param {import("@tonclient/core").KeyPair} keyPair
 */

let tonOSSEGiver = {
    abi: { "ABI version": 1, "functions": [{ "name": "constructor", "inputs": [], "outputs": [] }, { "name": "sendGrams", "inputs": [{ "name": "dest", "type": "address" }, { "name": "amount", "type": "uint64" }], "outputs": [] }], "events": [], "data": [] },
    address: '0:841288ed3b55d9cdafa806807f02a0ae0c169aa5edfe88a789a6482429756a94',
    keyPair: {
        public: 'c29089f9d734ee23fafc8938f8c2f0ced7b47e6ea625511ce837cdba2a3289c8',
        secret: '60db8ac5bb9fb0e3d0f1e127c32e5af022596906c10af6d3c8e2031bb58a1cdc'
    }
}

let devnetConfig = {
    abi: {
        "ABI version": 2,
        "header": ["pubkey", "time", "expire"],
        "functions": [{
                "name": "constructor",
                "inputs": [],
                "outputs": []
            },
            {
                "name": "sendGrams",
                "inputs": [
                    { "name": "dest", "type": "address" },
                    { "name": "amount", "type": "uint64" }
                ],
                "outputs": []
            }
        ],
        "data": [],
        "events": []
    },
    address: '0:49071fa23d4855b5788addfd4632896c265bb40b3df21bbb6c0772632de0824b',
}

module.exports = tonOSSEGiver;