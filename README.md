# wallet-ui

React library for using Aztec Wallet. Uses Aztec SDK.

A dApp developer can use the hosted `wallet-ui` at `wallet.aztec.network` to connect to Aztec Connect without handling the user login flow. Self-hosted versions should only be used for development.

Users are strongly recommended to access the official `wallet-ui` hosted at `wallet.aztec.network` with a password manager such that the correct domain is identified for autofill, or to carefully check the domain if backing up from a file. On the same note, dApp developers should expect users to have the best user experience using `wallet.aztec.network`.

# architecture

To use `wallet-ui`, the dApp (i.e, application using Aztec wallet) should use the wallet connect Aztec provider with a URL that is hosting this UI (i.e. `"wallet.aztec.network` unless in a test environment). Inside an iframe (after hand-off), a parallel session object conforming to `AztecWalletProvider` is also used. This session object uses a pop-up UI for generating spending and account private keys. Once initiated, the approval UI flow occurs in an iframe. The private keys are used to sign transactions and decrypt notes from an iframe, which provides an extra layer of security from malicious dApps.
