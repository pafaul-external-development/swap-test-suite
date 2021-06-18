# Introduction
![photo_2020-12-15_20-21-41](https://user-images.githubusercontent.com/18599919/111032509-ac9fbd80-841d-11eb-9639-843ef2d758b3.jpg)
Hello there! \
SVOI dev team greets you and would like to present the results of created Decentralized Exchange for the FreeTON Community contest: \
#23 FreeTon DEX Implementation Stage 2 Contest.

Goal of this work is to create Decentralized Exchange based on Liquidity Pool mechanism and develop instruments, such as 
debot and [site](https://tonswap.com) for interacting with developed smart contracts.
 
# Links
[![Channel on Telegram](https://img.shields.io/badge/-TON%20Swap%20TG%20chat-blue)](https://t.me/tonswap) 

Repository for smart contracts compilation and deployment - [https://github.com/SVOIcom/ton-testing-suite](https://github.com/SVOIcom/ton-testing-suite)

Used ton-solidity compiler - [solidity compiler v0.39.0](https://github.com/broxus/TON-Solidity-Compiler/tree/98892ddbd2817784857b54436d75b64a3fdf6eb1)

Used tvm-linker - [latest tvm linker](https://github.com/tonlabs/TVM-linker)

# VERY IMPORTANT INFORMATION

All of the instructions were tested on Ubuntu 18.04.

# TON testing suite

Set of tools for making testing smart contracts on TON easier.

## General description

This is repository containing tests and instruments for smart contract deployment and testing.

## Requiremnts to run tests

### Clonning repo
To run tests you will need to install required packages and mocha:
```shell
git clone https://github.com/SVOIcom/ton-testing-suite
cd ton-testing-suite
git submodule update --init --recursive
npm install .
npm install -g mocha 
```

### Compiling scripts
Then you need to build smart contracts (solc v0.36.0 required):
```shell
mkdir -p build
bash compile_cc.sh tonswap-SC/contracts/ build/
```

Or if you have downloaded compiled smart contracts from [tonswap-SC release page](https://github.com/SVOIcom/tonswap-SC/tags) \
then you need to unzip archive and copy it's contents to ```build/``` directory.
If you haven't created ```build``` directory yet, create it by running:
```shell
mkdir -p build
```

### Setting up network

If you wish to run tests at ton OS SE, then you need to configure network url. \
It is stored in file: [```config/general/networkConfig.js```](config/general/networkConfig.js)
You need to replace ```tonOSSE.network``` value with url to access your TON OS SE instance.


## Swap pair test
After preparations, you can run swap pair test:
```shell
mocha test/swapPairTest.js
```

## Deploy swap pair to local ton OS SE node:
To deploy swap pair so you can test it on local ton OS SE you need to run:
```shell
mocha test/swapPairTest.js
```

### If there are unexpected errors with no reason
Try running the same command with additional flag:
```shell
mocha --allow-uncaught test/swapPairTest.js
```
If this will not resolve existing problem - please contact our team for further investing of your case so we can provide all help that we can :)

## Deploy swap pair debot
To deploy ```Swap pair debot``` you will need to run following command: 
```shell
node test/deployDebot.js
```
Result of run with debot address and used keypair will be in file ```debotRes.json```

# Testing swap pair by using existing debot or site

For testing purposes we created some accounts with finished preparation stage: 
1. They all have transferred TONs to swap pair contract;
2. They all have transferred TIP-3 tokens to swap pair contract;
3. They are fully functional :)

Keypair with addresses are in file: [profile file](files/testProfiles.md)
They will totally work at our site [tonswap.com](https://swap.tonswap.com/) too!

Please consider using them for tests. If you want to perform all of above by yourself, please check file [for deploying test swap pair](test/deployTestSwapPair.js) and contact our team in [Telegram](https://t.me/tonswap) (or contact me in direct messages @pafaul) if you have any questions about full cycle of interaction with swap pair.
