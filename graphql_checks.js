const giverConfig = require('./config/contracts/giverConfig');
const networkConfig = require('./config/general/networkConfig');
const seedPhraseConfig = require('./config/general/seedPhraseConfig');
const { TonClient, signerNone, abiContract } = require("@tonclient/core");
const freeton = require('./src');

const ton = new freeton.TonWrapper({
    giverConfig: giverConfig,
    network: networkConfig.network,
    seed: seedPhraseConfig
});

futureAddress = process.argv[2];

async function main() {

    await ton.setup(1);


    await ton.ton.net.query_collection({
        collection: 'accounts',
        filter: {
            id: { eq: futureAddress }
        },
        result: 'balance acc_type'
    }).then(console.log).catch(console.log);

    await ton.ton.net.query_collection({
        collection: 'messages',
        filter: {
            src: { eq: futureAddress }
        },
        result: "msg_type status src dst value boc body"
    }).then(async s => s.result.forEach(async(el) =>
            console.log(el.dst))
        // await ton.ton.abi.decode_message_body({
        //     body: el.body,
        //     is_internal: false,
        //     // //     // token
        //     // //     //abi: abiContract({ "ABI version": 2, "header": ["time", "expire"], "functions": [{ "name": "constructor", "inputs": [], "outputs": [] }, { "name": "getDetails", "inputs": [], "outputs": [{ "components": [{ "name": "name", "type": "bytes" }, { "name": "symbol", "type": "bytes" }, { "name": "decimals", "type": "uint8" }, { "name": "wallet_code", "type": "cell" }, { "name": "root_public_key", "type": "uint256" }, { "name": "root_owner_address", "type": "address" }, { "name": "total_supply", "type": "uint128" }, { "name": "start_gas_balance", "type": "uint128" }], "name": "value0", "type": "tuple" }] }, { "name": "getWalletAddress", "inputs": [{ "name": "wallet_public_key_", "type": "uint256" }, { "name": "owner_address_", "type": "address" }], "outputs": [{ "name": "value0", "type": "address" }] }, { "name": "deployWallet", "inputs": [{ "name": "tokens", "type": "uint128" }, { "name": "grams", "type": "uint128" }, { "name": "wallet_public_key_", "type": "uint256" }, { "name": "owner_address_", "type": "address" }, { "name": "gas_back_address", "type": "address" }], "outputs": [] }, { "name": "deployEmptyWallet", "inputs": [{ "name": "grams", "type": "uint128" }, { "name": "wallet_public_key_", "type": "uint256" }, { "name": "owner_address_", "type": "address" }, { "name": "gas_back_address", "type": "address" }], "outputs": [] }, { "name": "mint", "inputs": [{ "name": "tokens", "type": "uint128" }, { "name": "to", "type": "address" }], "outputs": [] }, { "name": "proxyBurn", "inputs": [{ "name": "tokens", "type": "uint128" }, { "name": "sender_address", "type": "address" }, { "name": "callback_address", "type": "address" }, { "name": "callback_payload", "type": "cell" }], "outputs": [] }, { "name": "tokensBurned", "inputs": [{ "name": "tokens", "type": "uint128" }, { "name": "sender_public_key", "type": "uint256" }, { "name": "sender_address", "type": "address" }, { "name": "callback_address", "type": "address" }, { "name": "callback_payload", "type": "cell" }], "outputs": [] }, { "name": "withdrawExtraGas", "inputs": [], "outputs": [] }, { "name": "name", "inputs": [], "outputs": [{ "name": "name", "type": "bytes" }] }, { "name": "symbol", "inputs": [], "outputs": [{ "name": "symbol", "type": "bytes" }] }, { "name": "decimals", "inputs": [], "outputs": [{ "name": "decimals", "type": "uint8" }] }, { "name": "wallet_code", "inputs": [], "outputs": [{ "name": "wallet_code", "type": "cell" }] }, { "name": "total_supply", "inputs": [], "outputs": [{ "name": "total_supply", "type": "uint128" }] }, { "name": "start_gas_balance", "inputs": [], "outputs": [{ "name": "start_gas_balance", "type": "uint128" }] }], "data": [{ "key": 1, "name": "_randomNonce", "type": "uint256" }, { "key": 2, "name": "name", "type": "bytes" }, { "key": 3, "name": "symbol", "type": "bytes" }, { "key": 4, "name": "decimals", "type": "uint8" }, { "key": 5, "name": "wallet_code", "type": "cell" }, { "key": 6, "name": "root_public_key", "type": "uint256" }, { "key": 7, "name": "root_owner_address", "type": "address" }], "events": [] })
        //     // // pair
        //     // abi: abiContract({ "ABI version": 2, "header": ["pubkey", "time", "expire"], "functions": [{ "name": "constructor", "inputs": [{ "name": "rootContract", "type": "address" }, { "name": "spd", "type": "uint256" }], "outputs": [] }, { "name": "getCreationTimestamp", "inputs": [], "outputs": [{ "name": "value0", "type": "uint256" }] }, { "name": "updateSwapPairCode", "inputs": [{ "name": "newCode", "type": "cell" }, { "name": "newCodeVersion", "type": "uint32" }], "outputs": [] }, { "name": "getWalletAddressCallback", "inputs": [{ "name": "walletAddress", "type": "address" }], "outputs": [] }, { "name": "tokensReceivedCallback", "inputs": [{ "name": "token_wallet", "type": "address" }, { "name": "token_root", "type": "address" }, { "name": "amount", "type": "uint128" }, { "name": "sender_public_key", "type": "uint256" }, { "name": "sender_address", "type": "address" }, { "name": "sender_wallet", "type": "address" }, { "name": "original_gas_to", "type": "address" }, { "name": "updated_balance", "type": "uint128" }, { "name": "payload", "type": "cell" }], "outputs": [] }, { "name": "getPairInfo", "inputs": [], "outputs": [{ "components": [{ "name": "rootContract", "type": "address" }, { "name": "tokenRoot1", "type": "address" }, { "name": "tokenRoot2", "type": "address" }, { "name": "tokenWallet1", "type": "address" }, { "name": "tokenWallet2", "type": "address" }, { "name": "deployerPubkey", "type": "uint256" }, { "name": "deployTimestamp", "type": "uint256" }, { "name": "swapPairAddress", "type": "address" }, { "name": "uniqueId", "type": "uint256" }, { "name": "swapPairCodeVersion", "type": "uint32" }], "name": "info", "type": "tuple" }] }, { "name": "getUserBalance", "inputs": [], "outputs": [{ "components": [{ "name": "tokenRoot1", "type": "address" }, { "name": "tokenRoot2", "type": "address" }, { "name": "tokenBalance1", "type": "uint128" }, { "name": "tokenBalance2", "type": "uint128" }], "name": "ubi", "type": "tuple" }] }, { "name": "getExchangeRate", "inputs": [{ "name": "swappableTokenRoot", "type": "address" }, { "name": "swappableTokenAmount", "type": "uint128" }], "outputs": [{ "name": "rate", "type": "uint256" }] }, { "name": "withdrawToken", "inputs": [{ "name": "withdrawalTokenRoot", "type": "address" }, { "name": "receiveTokenWallet", "type": "address" }, { "name": "amount", "type": "uint128" }], "outputs": [] }, { "name": "provideLiquidity", "inputs": [{ "name": "maxFirstTokenAmount", "type": "uint128" }, { "name": "maxSecondTokenAmount", "type": "uint128" }], "outputs": [{ "name": "providedFirstTokenAmount", "type": "uint128" }, { "name": "providedSecondTokenAmount", "type": "uint128" }] }, { "name": "withdrawLiquidity", "inputs": [{ "name": "minFirstTokenAmount", "type": "uint128" }, { "name": "minSecondTokenAmount", "type": "uint128" }], "outputs": [{ "name": "withdrawedFirstTokenAmount", "type": "uint128" }, { "name": "withdrawedSecondTokenAmount", "type": "uint128" }] }, { "name": "swap", "inputs": [{ "name": "swappableTokenRoot", "type": "address" }, { "name": "swappableTokenAmount", "type": "uint128" }], "outputs": [{ "name": "targetTokenAmount", "type": "uint128" }] }, { "name": "_getLiquidityPoolTokens", "inputs": [], "outputs": [{ "components": [{ "name": "token1", "type": "address" }, { "name": "token2", "type": "address" }, { "name": "token1LPAmount", "type": "uint256" }, { "name": "token2LPAmount", "type": "uint256" }], "name": "dlpi", "type": "tuple" }] }, { "name": "_getUserLiquidityPoolTokens", "inputs": [], "outputs": [{ "components": [{ "name": "token1", "type": "address" }, { "name": "token2", "type": "address" }, { "name": "token1LPAmount", "type": "uint256" }, { "name": "token2LPAmount", "type": "uint256" }], "name": "dlpi", "type": "tuple" }] }, { "name": "_getExchangeRateSimulation", "inputs": [{ "name": "t1", "type": "uint256" }, { "name": "t2", "type": "uint256" }, { "name": "swapToken1", "type": "uint256" }, { "name": "swapToken2", "type": "uint256" }], "outputs": [{ "components": [{ "name": "numerator", "type": "uint256" }, { "name": "denominator", "type": "uint256" }, { "name": "exchangeResultToken1", "type": "uint256" }, { "name": "exchangeResultToken2", "type": "uint256" }], "name": "deri", "type": "tuple" }] }, { "name": "kLast", "inputs": [], "outputs": [{ "name": "kLast", "type": "uint256" }] }], "data": [{ "key": 1, "name": "token1", "type": "address" }, { "key": 2, "name": "token2", "type": "address" }, { "key": 3, "name": "swapPairID", "type": "uint256" }], "events": [] })
        //     // wallet
        //     abi: abiContract({ "ABI version": 2, "header": ["time", "expire"], "functions": [{ "name": "constructor", "inputs": [], "outputs": [] }, { "name": "getDetails", "inputs": [], "outputs": [{ "components": [{ "name": "root_address", "type": "address" }, { "name": "code", "type": "cell" }, { "name": "wallet_public_key", "type": "uint256" }, { "name": "owner_address", "type": "address" }, { "name": "balance", "type": "uint128" }], "name": "value0", "type": "tuple" }] }, { "name": "accept", "inputs": [{ "name": "tokens", "type": "uint128" }], "outputs": [] }, { "name": "allowance", "inputs": [], "outputs": [{ "components": [{ "name": "remaining_tokens", "type": "uint128" }, { "name": "spender", "type": "address" }], "name": "value0", "type": "tuple" }] }, { "name": "approve", "inputs": [{ "name": "spender", "type": "address" }, { "name": "remaining_tokens", "type": "uint128" }, { "name": "tokens", "type": "uint128" }], "outputs": [] }, { "name": "disapprove", "inputs": [], "outputs": [] }, { "name": "transferToRecipient", "inputs": [{ "name": "recipient_public_key", "type": "uint256" }, { "name": "recipient_address", "type": "address" }, { "name": "tokens", "type": "uint128" }, { "name": "deploy_grams", "type": "uint128" }, { "name": "transfer_grams", "type": "uint128" }], "outputs": [] }, { "name": "transferToRecipientWithNotify", "inputs": [{ "name": "recipient_public_key", "type": "uint256" }, { "name": "recipient_address", "type": "address" }, { "name": "tokens", "type": "uint128" }, { "name": "deploy_grams", "type": "uint128" }, { "name": "transfer_grams", "type": "uint128" }, { "name": "payload", "type": "cell" }], "outputs": [] }, { "name": "transfer", "inputs": [{ "name": "to", "type": "address" }, { "name": "tokens", "type": "uint128" }, { "name": "grams", "type": "uint128" }], "outputs": [] }, { "name": "transferWithNotify", "inputs": [{ "name": "to", "type": "address" }, { "name": "tokens", "type": "uint128" }, { "name": "grams", "type": "uint128" }, { "name": "payload", "type": "cell" }], "outputs": [] }, { "name": "transferFrom", "inputs": [{ "name": "from", "type": "address" }, { "name": "to", "type": "address" }, { "name": "tokens", "type": "uint128" }, { "name": "grams", "type": "uint128" }], "outputs": [] }, { "name": "transferFromWithNotify", "inputs": [{ "name": "from", "type": "address" }, { "name": "to", "type": "address" }, { "name": "tokens", "type": "uint128" }, { "name": "grams", "type": "uint128" }, { "name": "payload", "type": "cell" }], "outputs": [] }, { "name": "internalTransfer", "inputs": [{ "name": "tokens", "type": "uint128" }, { "name": "sender_public_key", "type": "uint256" }, { "name": "sender_address", "type": "address" }, { "name": "send_gas_to", "type": "address" }, { "name": "notify_receiver", "type": "bool" }, { "name": "payload", "type": "cell" }], "outputs": [] }, { "name": "internalTransferFrom", "inputs": [{ "name": "to", "type": "address" }, { "name": "tokens", "type": "uint128" }, { "name": "send_gas_to", "type": "address" }, { "name": "notify_receiver", "type": "bool" }, { "name": "payload", "type": "cell" }], "outputs": [] }, { "name": "burnByOwner", "inputs": [{ "name": "tokens", "type": "uint128" }, { "name": "grams", "type": "uint128" }, { "name": "callback_address", "type": "address" }, { "name": "callback_payload", "type": "cell" }], "outputs": [] }, { "name": "burnByRoot", "inputs": [{ "name": "tokens", "type": "uint128" }, { "name": "callback_address", "type": "address" }, { "name": "callback_payload", "type": "cell" }], "outputs": [] }, { "name": "setReceiveCallback", "inputs": [{ "name": "receive_callback_", "type": "address" }], "outputs": [] }, { "name": "destroy", "inputs": [{ "name": "gas_dest", "type": "address" }], "outputs": [] }, { "name": "balance", "inputs": [], "outputs": [{ "name": "balance", "type": "uint128" }] }, { "name": "receive_callback", "inputs": [], "outputs": [{ "name": "receive_callback", "type": "address" }] }, { "name": "target_gas_balance", "inputs": [], "outputs": [{ "name": "target_gas_balance", "type": "uint128" }] }], "data": [{ "key": 1, "name": "root_address", "type": "address" }, { "key": 2, "name": "code", "type": "cell" }, { "key": 3, "name": "wallet_public_key", "type": "uint256" }, { "key": 4, "name": "owner_address", "type": "address" }], "events": [] })
        // })
        // .then(console.log).catch(console.log)
    ).catch(console.log);

    //process.exit(0);
}

main();

/*await ton.ton.abi.decode_message_body({
               body: s.body,
               is_internal: true,
               abi: abiContract({
                   "ABI version": 2,
                   "header": ["pubkey", "time", "expire"],
                   "functions": [{
                           "name": "getCreationTimestamp",
                           "inputs": [],
                           "outputs": [
                               { "name": "value0", "type": "uint256" }
                           ]
                       }, {
                           "name": "getWalletAddressCallback",
                           "inputs": [
                               { "name": "walletAddress", "type": "address" }
                           ],
                           "outputs": []
                       },
                       {
                           "name": "tokensReceivedCallback",
                           "inputs": [
                               { "name": "token_wallet", "type": "address" },
                               { "name": "token_root", "type": "address" },
                               { "name": "amount", "type": "uint128" },
                               { "name": "sender_public_key", "type": "uint256" },
                               { "name": "sender_address", "type": "address" },
                               { "name": "sender_wallet", "type": "address" },
                               { "name": "original_gas_to", "type": "address" },
                               { "name": "updated_balance", "type": "uint128" },
                               { "name": "payload", "type": "cell" }
                           ],
                           "outputs": []
                       },
                       {
                           "name": "getPairInfo",
                           "inputs": [],
                           "outputs": [
                               { "components": [{ "name": "rootContract", "type": "address" }, { "name": "tokenRoot1", "type": "address" }, { "name": "tokenRoot2", "type": "address" }, { "name": "tokenWallet1", "type": "address" }, { "name": "tokenWallet2", "type": "address" }, { "name": "deployerPubkey", "type": "uint256" }, { "name": "deployTimestamp", "type": "uint256" }, { "name": "swapPairAddress", "type": "address" }, { "name": "uniqueId", "type": "uint256" }, { "name": "swapPairCodeVersion", "type": "uint32" }], "name": "info", "type": "tuple" }
                           ]
                       },
                       {
                           "name": "getUserBalance",
                           "inputs": [],
                           "outputs": [
                               { "components": [{ "name": "tokenRoot1", "type": "address" }, { "name": "tokenRoot2", "type": "address" }, { "name": "tokenBalance1", "type": "uint128" }, { "name": "tokenBalance2", "type": "uint128" }], "name": "ubi", "type": "tuple" }
                           ]
                       },
                       {
                           "name": "getExchangeRate",
                           "inputs": [
                               { "name": "swappableTokenRoot", "type": "address" },
                               { "name": "swappableTokenAmount", "type": "uint128" }
                           ],
                           "outputs": [
                               { "name": "rate", "type": "uint256" }
                           ]
                       },
                       {
                           "name": "withdrawToken",
                           "inputs": [
                               { "name": "withdrawalTokenRoot", "type": "address" },
                               { "name": "receiveTokenWallet", "type": "address" },
                               { "name": "amount", "type": "uint128" }
                           ],
                           "outputs": []
                       },
                       {
                           "name": "provideLiquidity",
                           "inputs": [
                               { "name": "maxFirstTokenAmount", "type": "uint128" },
                               { "name": "maxSecondTokenAmount", "type": "uint128" }
                           ],
                           "outputs": [
                               { "name": "providedFirstTokenAmount", "type": "uint128" },
                               { "name": "providedSecondTokenAmount", "type": "uint128" }
                           ]
                       },
                       {
                           "name": "withdrawLiquidity",
                           "inputs": [
                               { "name": "minFirstTokenAmount", "type": "uint128" },
                               { "name": "minSecondTokenAmount", "type": "uint128" }
                           ],
                           "outputs": [
                               { "name": "withdrawedFirstTokenAmount", "type": "uint128" },
                               { "name": "withdrawedSecondTokenAmount", "type": "uint128" }
                           ]
                       },
                       {
                           "name": "swap",
                           "inputs": [
                               { "name": "swappableTokenRoot", "type": "address" },
                               { "name": "swappableTokenAmount", "type": "uint128" }
                           ],
                           "outputs": [
                               { "name": "targetTokenAmount", "type": "uint128" }
                           ]
                       },
                       {
                           "name": "_getLiquidityPoolTokens",
                           "inputs": [],
                           "outputs": [
                               { "components": [{ "name": "token1", "type": "address" }, { "name": "token2", "type": "address" }, { "name": "token1LPAmount", "type": "uint256" }, { "name": "token2LPAmount", "type": "uint256" }], "name": "dlpi", "type": "tuple" }
                           ]
                       },
                       {
                           "name": "_getUserLiquidityPoolTokens",
                           "inputs": [],
                           "outputs": [
                               { "components": [{ "name": "token1", "type": "address" }, { "name": "token2", "type": "address" }, { "name": "token1LPAmount", "type": "uint256" }, { "name": "token2LPAmount", "type": "uint256" }], "name": "dlpi", "type": "tuple" }
                           ]
                       },
                       {
                           "name": "_getExchangeRateSimulation",
                           "inputs": [
                               { "name": "t1", "type": "uint256" },
                               { "name": "t2", "type": "uint256" },
                               { "name": "swapToken1", "type": "uint256" },
                               { "name": "swapToken2", "type": "uint256" }
                           ],
                           "outputs": [
                               { "components": [{ "name": "numerator", "type": "uint256" }, { "name": "denominator", "type": "uint256" }, { "name": "exchangeResultToken1", "type": "uint256" }, { "name": "exchangeResultToken2", "type": "uint256" }], "name": "deri", "type": "tuple" }
                           ]
                       },
                       {
                           "name": "kLast",
                           "inputs": [],
                           "outputs": [
                               { "name": "kLast", "type": "uint256" }
                           ]
                       }
                   ],
                   "data": [
                       { "key": 1, "name": "token1", "type": "address" },
                       { "key": 2, "name": "token2", "type": "address" },
                       { "key": 3, "name": "swapPairID", "type": "uint256" }
                   ],
                   "events": []
               })
           }*/