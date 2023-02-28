# wallet-ui

Demo react library for using a secure Aztec Wallet. Uses Aztec Alpha SDK that demos this feature.

This repository implements a proof of concept of a segregated secure wallet using standard web technologies.

A dApp developer can use a hosted `wallet-ui` to connect to Aztec Connect, and users can trust a hosted `wallet-ui` to keep their credentials from dApps.

An example dApp can be found here: https://github.com/AztecProtocol/aztec-frontend-boilerplate/tree/jc/new-sdk

## architecture

The structure of entry points is mandated by the walletconnect connection flow, there are three entry points to the wallet:

- The /wc walletconnect callback: opened by web3Modal with a pairing proposal. It will create/unlock the Aztec wallet and then ask the user to accept or deny the pairing.
- The /iframe: Will be opened inside the dapp as an iframe to perform long-running operations such as note decryption. It will also show the transaction approval UI.
- The /popup: Will offer the session data to the iframe (Aztec keys, walletconnect session...) to bypass browser iframe storage partitioning.

### connection flow

The rationale behind this connection flow can be found here: [Handing over Walletconnect sessions](docs/wallet-connect.md).

To use `wallet-ui`, the dApp (i.e, application using Aztec wallet) should open the url `WALLET_URL/wc?uri=URI`. The typical way of doing this is using web3modal as follows:

```typescript
const core = new Core({
  projectId: process.env.WALLETCONNECT_PROJECT_ID,
});

const signClient = await SignClient.init({
  core,
  metadata: dappMetadata,
});
// Manually add the wallet url during development
const web3Modal = new Web3Modal({
  projectId: process.env.WALLETCONNECT_PROJECT_ID,
  desktopWallets: [
    {
      id: 'aztec-wallet',
      name: 'Aztec Wallet',
      links: {
        universal: process.env.WALLET_URL,
        native: '',
      },
    },
  ],
  mobileWallets: [
    {
      id: 'aztec-wallet',
      name: 'Aztec Wallet',
      links: {
        universal: process.env.WALLET_URL,
        native: '',
      },
    },
  ],
  walletImages: {
    'aztec-wallet': process.env.WALLET_IMAGE_URL,
  },
});

const chains = [`aztec:${aztecChainId}`];

const { uri, approval } = await signClient.connect({
  requiredNamespaces: {
    aztec: {
      methods: [],
      chains,
      events: RPC_METHODS,
    },
  },
});
// Now the user can select the wallet to open the wc callback
await web3Modal.openModal({ uri, standaloneChains: chains });
```

After the user has unlocked the wallet and accepted the walletconnect proposal, the `/wc` callback will close itself to come back to the dapp. The dapp will then create an AztecWalletProvider with the walletconnect session:

```typescript
const session = await approval();

web3Modal.closeModal();

const awpClient = new AztecWalletProviderClient(new EIP1193SignClient(signClient, aztecChainId, session));

const aztecWalletProvider = await awpClient.init();
```

At this point, the `AztecWalletProviderClient` will figure out that the wallet metadata marks it as an 'iframable' wallet. The `AztecWalletProviderClient` will create an iframe pointing to `WALLET_URL/iframe?topic=WALLETCONNECT_SESSION_TOPIC&aztecAccount=ACCOUNT_PUBLIC_KEY`.

Since storage is isolated in third party iframes in many browsers, the iframe will need to fetch the walletconnect session and the Aztec keys from the standalone wallet. In order to do so it will open a popup to the url `WALLET_URL/popup`. The popup will prompt the user to unlock the keystore and approve the connection, sending the Account and Spending keys to the embedded iframe along with the walletconnect session.

Once the iframe has received all required data, it'll initiate a parallel session object conforming to `AztecWalletProvider` to serve all the requests coming from the dapp. Once initiated, the transaction approval UI flow occurs in an iframe. The private keys are used to sign transactions and decrypt notes from an iframe, which provides an extra layer of security from malicious dApps.

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

## Password manager

Overall password management works by associating the passcode with a 'Aztec Passcode' username and the aztec key with a 'Aztec Key' username.

On the create account flow screen 1 where we enter our passcode and alias, we have a username field with 'Aztec Passcode' and a password field with the passcode, and a password manager will offer to save this pair.

On the encryption key flow screen 2 we generate an aztec key in a field, we have a hidden Aztec Key username field and use `navigator.credentials.store(cred)` to trigger a passcode save in Chrome. Unfortunately, in other browsers like Firefox, the user must type into this field for this to trigger.

When signing in with a cached encryption key, we use a hidden username with the alias to recall the passcode.
When signing in with both aztec key and passcode, we use a hidden username field with Aztec Key to recall the aztec key.
