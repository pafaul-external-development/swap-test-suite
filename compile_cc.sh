#!/bin/bash

SC_DIR=$1
TARGET_DIR=$2
COMPILE_SH=$(cd $(dirname $0) && pwd)/compile_sc.sh

[ -z ${SC_DIR} ] && echo "SC dir does not exist" && exit 1
[ -z ${TARGET_DIR} ] && mkdir -p ${TARGET_DIR}

bash ${COMPILE_SH} ${SC_DIR} TONTokenWallet $TARGET_DIR
bash ${COMPILE_SH} ${SC_DIR} RootTokenContract $TARGET_DIR
bash ${COMPILE_SH} ${SC_DIR}/tests CallbackTestContract $TARGET_DIR
bash ${COMPILE_SH} ${SC_DIR}/tests DeployEmptyWalletFor $TARGET_DIR