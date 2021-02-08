#!/bin/bash

SC_DIR=$1
TARGET_DIR=$2
COMPILE_SH=$(cd $(dirname $0) && pwd)/compile_sc.sh

bash ${COMPILE_SH} ${SC_DIR} TONTokenWallet $TARGET_DIR
bash ${COMPILE_SH} ${SC_DIR} RootTokenContract $TARGET_DIR
bash ${COMPILE_SH} ${SC_DIR}/tests CallbackTestContract $TARGET_DIR
bash ${COMPILE_SH} ${SC_DIR}/tests DeployEmptyWalletFor $TARGET_DIR
