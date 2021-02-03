let rootParameters = {
    // В корневом контракте присутствуют только initial параметры
    initParams: {
        name_: "TestRootContract",
        symbol_: "TRC",
        decimals_: 9,
        wallet_code_: "", // Нужно будет добавить код кошелька
        root_public_key_: "pubkey",
        root_owner_address_: "0:0000000000000000000000000000000000000000000000000000000000000000", // Для рут контракта используем только pubkey
        _randomNonce: 0
    },
    constructorParams: {}
}

module.exports = rootParameters;