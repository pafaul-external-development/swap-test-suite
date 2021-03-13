# TON testing suite

Set of tools for making testing smart contracts on TON easier.

## General description

This is repository containing tests and instruments for smart contract deployment and testing.

## Requiremnts to run tests

To run tests you will need to install required packages and mocha:
```shell
git clone https://github.com/SVOIcom/ton-testing-suite
cd ton-testing-suite
npm install .
npm install -g mocha 
```

Then you need to build smart contracts (solc v0.36.0 required):
```shell
mkdir -p build
bash compile_cc.sh contracts/ build/
```

## Swap pair test
After preparations, you can run swap pair test:
```shell
mocha test/swapPairTest.js
```

## Deploy swap pair to local ton OS SE node:
To deploy swap pair so you can test it on local ton OS SE you need to run:
```shell
mocha test/deployTestSwapPair.js
```
Result of swap pair, TIP-3 and wallets deployment will be in file ```test/spRes.json```

## Deploy swap pair debot
To deploy ```Swap pair debot``` you will need to run following command: 
```shell
node test/deployDebot.js
```
Result of run with debot address and used keypair will be in file ```test/debotRes.json```

# Debot functionality
Using debot you can perform following operations:

1. Get user token balance - get token amounts available for providing liquidity or performing swap operation;
2. Get user LP token balance - get user's tokens that are currently in liquidity pool;
3. Provide liquidity - add tokens to liquidity pool;
4. Withdraw liquidity - remove tokens from liquidity pool;
5. Get current exchange rate;
6. Swap tokens - swap user's tokens that are currently not in liquidity pool;
7. Withdraw tokens from swap pair - remove tokens from swap pair by requesting transfer of tokens to specified wallet;
8. Exit debot :)

For your convinience, check following file that contrains some SC addresses: 

# Testing swap pair by using existing debot or site

For testing purposes we created some accounts with finished preparation stage: 
1. They all have transferred TONs to swap pair contract;
2. They all have transferred TIP-3 tokens to swap pair contract;
3. They are fully functional :)

Keypair with addresses are in file: [secret file](files/testProfiles.md)

Please consider using them for tests. If you want to perform all of above by yourself, please check file [for deploying test swap pair](test/deployTestSwapPair.js) and contact me in TG (@pafaul) if you have any questions about full cycle of interaction with swap pair.
