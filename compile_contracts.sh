#!/bin/bash

SC_DIR=$1
COMPILE_SH=$(cd $(dirname $0) && pwd)/compile_sc.sh

bash ${COMPILE_SH} ${SC_DIR} TONTokenWallet
bash ${COMPILE_SH} ${SC_DIR} RootTokenContract
bash ${COMPILE_SH} ${SC_DIR}/tests CallbackTestContract
bash ${COMPILE_SH} ${SC_DIR}/tests DeployEmptyWalletFor