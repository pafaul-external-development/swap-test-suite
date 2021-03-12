#!/bin/bash

SC_DIR=$1
SC_NAME=$2
TARGET_DIR=$3

pushd ${SC_DIR} &> /dev/null
solc ${SC_NAME}.sol
res=$?
[ $res -ne 0 ] && exit 1 
tvm_linker compile --lib /usr/lib/ton/stdlib_sol.tvm --abi-json ${SC_NAME}.abi.json ${SC_NAME}.code > .tmp
res=$?
[ $res -ne 0 ] && exit 2
TVC_FILE=$(cat .tmp | grep 'Saved contract to file' | awk '{print $5}')
base64 < ${TVC_FILE} > ${SC_NAME}.base64
mv ${TVC_FILE} ${SC_NAME}.tvc
popd &> /dev/null

cp ${SC_DIR}/${SC_NAME}.* ${TARGET_DIR}/.
