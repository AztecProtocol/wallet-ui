# wallet-ui

Demo react library for using a secure Aztec Wallet. Uses Aztec Alpha SDK that demos this feature.

This repository implements a proof of concept of a segregated secure wallet using standard web technologies.

A dApp developer can use a hosted `wallet-ui` to connect to Aztec Connect, and users can trust a hosted `wallet-ui` to keep their credentials from dApps.

An example dApp can be found here: https://github.com/AztecProtocol/aztec-frontend-boilerplate/tree/jc/new-sdk

## architecture

To use `wallet-ui`, the dApp (i.e, application using Aztec wallet) should use the wallet connect Aztec provider with a URL that is hosting this UI. Inside an iframe (after hand-off), a parallel session object conforming to `AztecWalletProvider` is also used. This session object uses a pop-up UI for generating spending and account private keys. Once initiated, the approval UI flow occurs in an iframe. The private keys are used to sign transactions and decrypt notes from an iframe, which provides an extra layer of security from malicious dApps.

## development

Run `bootstrap.sh` and follow the instructions there.
When building, the chain id and rollup-provider are currently hardcoded by each build instruction. The hosted version is hardcoded for production falafel and mainnet EVM.

## videos

1. High-level overview

Brief video about the wallet vs dApp separation
https://user-images.githubusercontent.com/163993/221016230-26feffe5-1408-4275-bb85-5b5e28d4c675.mov

2. Create account

Shows create account flow
https://user-images.githubusercontent.com/163993/221016587-026dc46b-c590-4582-8986-45ada86f15f9.mov

3. Login

Shows login flow
https://user-images.githubusercontent.com/163993/221016437-483aa631-8084-4b13-9887-af0443e634a0.mov

4. Transactions

Shows transaction approval flow
https://user-images.githubusercontent.com/5372114/221233460-36cdb484-3f6c-4ab8-884b-8f995eb26657.mp4

See more:

- [Secure key generation](https://hackmd.io/@aztec-network/SkMotEaIo)
- [Handing over Walletconnect sessions](docs/wallet-connect.md)

## Password manager

Overall password management works by associating the passcode with the alias and the aztec key with a blank username.
On chrome, `navigator.credentials.store(cred)` is used to show the passcode popup.
