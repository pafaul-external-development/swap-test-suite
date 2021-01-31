let rootParameters = {
    // В корневом контракте присутствуют только initial параметры
    initialParameters: {
        name_: "TestRootContract",
        symbol_: "TRC",
        decimals_: 9,
        wallet_code_: "", // Нужно будет добавить код кошелька
        root_public_key_: "pubkey",
        root_owner_address_: "", // Для рут контракта используем только pubkey
    },
    constructorParameters: {}
}

module.exports = rootParameters;