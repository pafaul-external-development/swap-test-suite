function toHex(str) {
    return Buffer.from(str, 'utf8').toString('hex');
}

let rootParameters = {
    // В корневом контракте присутствуют только initial параметры
    initParams: {
        name: toHex('TestRootContract'),
        symbol: toHex('TRC'),
        decimals: 9,
        wallet_code: "", // Нужно будет добавить код кошелька
        root_public_key: "pubkey",
        root_owner_address: "0:0000000000000000000000000000000000000000000000000000000000000000", // Для рут контракта используем только pubkey
        _randomNonce: 0
    },
    constructorParams: {}
}

module.exports = rootParameters;