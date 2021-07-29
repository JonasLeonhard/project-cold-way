#!/bin/bash

# Exit on Error
set - e

echo -e "🐲 Building Janusjs..."

git clone https://github.com/meetecho/janus-gateway.git janus-gateway
cd ./janus-gateway/npm  || exit 
yarn
yarn rollup -- --o ../../janus.js --f cjs # or es, iffe, umd, amd, ...
cp janus.d.ts ../..
cd ../..
rm -rf janus-gateway

echo -e "🐲 Build janus.js in /janusjs/janus.js"