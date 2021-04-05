#!/bin/bash

SC_DIR=$1
TARGET_DIR=$2
COMPILE_SH=$(cd $(dirname $0) && pwd)/compile_sc.sh

[ -z ${SC_DIR} ] && echo "SC dir does not exist" && exit 1
[ -z ${TARGET_DIR} ] && mkdir -p ${TARGET_DIR}

bash ${COMPILE_SH} ${SC_DIR}/ton-eth-bridge-token-contracts/free-ton/contracts/ TONTokenWallet $TARGET_DIR
bash ${COMPILE_SH} ${SC_DIR}/ton-eth-bridge-token-contracts/free-ton/contracts/ RootTokenContract $TARGET_DIR
bash ${COMPILE_SH} ${SC_DIR}/ton-eth-bridge-token-contracts/free-ton/contracts/tests CallbackTestContract $TARGET_DIR
bash ${COMPILE_SH} ${SC_DIR}/ton-eth-bridge-token-contracts/free-ton/contracts/tests DeployEmptyWalletFor $TARGET_DIR

bash ${COMPILE_SH} ${SC_DIR}/contracts/additional/ GiverContract ${TARGET_DIR}
bash ${COMPILE_SH} ${SC_DIR}/contracts/additional/ DevNetGiver ${TARGET_DIR}
bash ${COMPILE_SH} ${SC_DIR}/contracts/additional/ PairDeployer ${TARGET_DIR}
bash ${COMPILE_SH} ${SC_DIR}/contracts/additional/ TONStorage ${TARGET_DIR}

bash ${COMPILE_SH} ${SC_DIR}/contracts/SwapPair RootSwapPairContract $TARGET_DIR
bash ${COMPILE_SH} ${SC_DIR}/contracts/SwapPair SwapPairContract $TARGET_DIR

bash ${COMPILE_SH} ${SC_DIR}/contracts/debot debot ${TARGET_DIR}