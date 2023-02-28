# Handing over Walletconnect sessions

## The objective

We want to create a walletconnect compatible web wallet that allows the dapps to, once a session is established, to create an iframe of the web wallet to have a long running instance of the wallet.

It's necessary to handover the walletconnect connection from the fully-fledged website wallet to the newly created iframe specifically for that dapp.

## But what's exactly a session?

In Walletconnect, after a pairing is established, a session is established using that pairing. A session in the view of the wallet has the following data:

- A peer public key
- A local keypair
- A symmetric key that can be generated using the two public keys
- A topic derived as the hash of the symmetric key
- Metadata about the peer
- A namespace (the set of methods, events and accounts offered in the session)
- A expiration timestamp

## How walletconnect uses this data

Walletconnect splits its logic in different controllers (crypto, pairing, subscription, signClient), each one storing its data representation (sometimes redundant with the data of other controllers) in a different key in a storage class. This storage class is customizable but it's typically a wrapper of localStorage.

When a walletconnect instance is initiated, all the controllers are created and they try to read from storage the data necessary for the walletconnect operation. For example, the subscription controller reads all the topics that it should be subscribed to and subscribes to those in the relay server.

This causes that a new instance of a website that uses walletconnect is going to take ownership of all sessions and pairings, since its subscription module will subscribe to all these topics.

This can be problematic for our objective, since we want the iframed instances of the wallet to take hold of the connection with the specific dapp only.

## A solution

![](https://i.imgur.com/kcgzrwK.png)

### Prerequisites

In order to implement this structure we need a way to find out if the wallet is running inside an iframe, and also who the opener of the iframe is.
We also need to avoid the iframe getting visibility of the pairings/sessions/subscriptions/etc if the localstorage is shared in the current browser between the iframe and the wallet. In order to do this, we can pass a referrer-partitioned instance to the WalletConnect core if we detect that we are running inside an iframe. This way we have consistent transient storage for iframe'd WCs.

### Pairing establishment

When the dapp considers that a session needs to be established, it will create a new SignClient, get a pairing uri and open Web3Modal with the Uri. The Aztec wallet will be present in the list and on click by the user, a new tab/window for the wallet will be opened with the uri as param.

The wallet tab will open and detect that is running in standalone (non-iframe) mode. It'll create a regular SignClient with real localStorage and accept the pairing using the URI passed as parameter. A new session will be created and persisted. Here is when all the wallet-specific checks (the keystore for the account is opened, user accepts the connection) happen.

The response of the pairing creation will include metadata that signals that the wallet is iframable. Due to anti tracking features of multiple browsers, direct connection between the standalone instance and an iframe is not possible. This standalone instance can be closed.

### Iframe creation and handover via popup

When the dapp receives the response to the pairing/session from the SignClient, the metadata will inform it that the wallet is iframable and will contain the url of the wallet. The dapp will then open an iframe for the aztec wallet, passing the session topic.

The wallet will recognize itself as running in an iframe and will find no active wc session for that topic in its storage, so it will request the parent dapp to become visible to show a "Connect" button.

When the connect button is clicked, the iframe will open a popup instance of the wallet via window.open(). This newly created instance of the wallet will be able to access unpartitioned local storage and is able to send it back to the iframe via `window.parent.postMessage`.

The popup instance of the wallet will receive the message and will find the session created for that topic. It will send the iframe over BroadcastChannel all the data necessary to recreate the session on the iframe side:

- The session object
- The private key of the session

The standalone wallet will then forget about the session, removing the session, the key and the subscription to the topic.

The iframe wallet will receive the session data and:

- Restore the session private key
- Regenerate the session symmetric key
- Add the session data structure to the client
- Subscribe to the session topic to start receiving messages

With this steps, the connection handover is complete. The iframe will start receiving all the messages of the session topic and only that session topic.

### Implementation

Example wallet implementation: https://github.com/AztecProtocol/aztec2-internal/tree/arv/walletconnect_wallet/yarn-project/wallet

The wallet needs to implement the following features for iframable walletconnect:

- Should be openable in the /wc path for [walletconnect universal linking](https://github.com/WalletConnect/web3modal/blob/V2/packages/core/src/utils/CoreUtil.ts#L60)
  - Will have the WC uri as query parameter
  - Should accept/deny the session request providing a list of method, events and addresses for the session
  - Should signal in the metadata that can be run in an iframe
- Should be openable in popup mode (window.opener is the iframe)
  - Should hand over the encrypted keystore and password to the opener (same origin)
  - if requested by the opener inside the window object, hand over the wc session for a given topic
- Should be openable in iframe mode
  - It should read the session topic from query params
  - Should have a visible button to trigger the popup
    - Should we use a protocol with the app to open/close the iframe viewport?
  - Should receive the keystore and the session from the popup and start handling the dapp requests
  - Should try to remember the session details in localstorage
    - Should it also try to remember the keystore? that way the popup click wouldn't be necessary on every tab / page refresh

The dapp only needs to add, on session creation or when reusing a cached session, code to open an iframe to the wallet if the metadata says it's iframable:

```typescript
const {
  peer: { metadata },
  topic,
} = session;

if (metadata.iframable) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('src', `${metadata.url}?topic=${topic}`);
  iframe.style.width = iframeWidth;
  iframe.style.height = iframeHeight;
  document.body.appendChild(iframe);
}
```
