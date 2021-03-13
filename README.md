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

After that, you can run swap pair test:
```shell
mocha test/swapPairTest.js
```

Or deploy swap pair so you can test it on local ton OS SE or at dev net:
```shell
mocha test/deployTestSwapPair.js
```
Result of swap pair, TIP-3 and wallets deployment will be in file ```test/spRes.json```
