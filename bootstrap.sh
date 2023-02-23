# install submodules
git submodule update --init --recursive

# install packages
yarn

echo "You will need to run 'export WALLETCONNECT_PROJECT_ID=...' with a valid wallet connect API key."
echo "Run yarn start:devnet to start the development server against a local rollup provider and EVM."
echo "Run yarn start to start the development server against Ethereum mainnet."
echo "You will then need to use an Aztec client like the example client (hummus) in the SDK repo with the wallet URL pointing to localhost:1235"