# wallet-ui

React library for using Aztec Wallet. Uses Aztec SDK.

A dApp developer can use the hosted `wallet-ui` at `wallet.aztec.network` to connect to Aztec Connect without handling the user login flow. Self-hosted versions should only be used for development.

Users are strongly recommended to access the official `wallet-ui` hosted at `wallet.aztec.network` with a password manager such that the correct domain is identified for autofill. On the same note, dApp developers should expect users to have the best user experience using `wallet.aztec.network`.

# architecture

To use `wallet-ui`, the dApp (i.e, application using Aztec wallet) should use `createIframeAztecWalletProviderClient` with a URL that is hosting this UI (i.e. `"wallet.aztec.network` unless in a test environment). This creates a session object conforming to the `AztecWalletProvider` interface. This session object performs everything by communicating via `postMessage` with the iframe.

Inside the iframe, a parallel session object conforming to `AztecWalletProvider` is also used. This session object uses a UI for generating spending and account private keys. Once initiated, the actual UI flow occurs in a pop-up. The private keys are then used to sign transactions using decrypted notes.
