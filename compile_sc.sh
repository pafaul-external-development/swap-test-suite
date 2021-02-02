#!/bin/bash

SC_DIR=$1
SC_NAME=$2

pushd ${SC_DIR}
/bin/solc ${SC_NAME}.sol
res=$?
[ $res -ne 0 ] && exit 1 
/bin/tvm_linker compile --lib /usr/lib/ton/stdlib_sol.tvm --abi-json ${SC_NAME}.abi.json ${SC_NAME}.code > .tmp
res=$?
[ $res -ne 0 ] && exit 2
TVC_FILE=$(cat .tmp | grep 'Saved contract to file' | awk '{print $5}')
mv ${TVC_FILE} ${SC_NAME}.tvc
base64 < ${SC_NAME}.tvc > ${SC_NAME}.base64