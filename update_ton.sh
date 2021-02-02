#!/bin/bash

cd /opt/TON-Solidity-Compiler
git pull
mkdir -p build
pushd build &> /dev/null
cmake ../compiler/ -DCMAKE_BUILD_TYPE=Release
cmake --build . -- -j8
cp solc/solc /bin/solc
popd &> /dev/null
cp lib/stdlib_sol.tvm /usr/lib/ton/

cd /opt/TVM-linker
git pull
pushd tvm_linker &> /dev/null
cargo build --release
cp target/release/tvm_linker /bin/
popd &> /dev/null