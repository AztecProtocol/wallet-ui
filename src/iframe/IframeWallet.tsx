import { useState, useEffect, useContext, useMemo } from 'react';
import { BarretenbergWasm, ServerRollupProvider, WalletConnectAztecWalletProviderServer } from '@aztec/sdk';
import { openPopup } from './handleHandover.js';
import useWalletConnectKeyStore from './useWalletConnectKeyStore.js';
import { BBWasmContext } from '../utils/wasmContext.js';
import { PopupTrigger } from '../components/popup_trigger/popup_trigger.js';
import { ApproveKeyStoreRequest } from '../components/approve_keystore_request/approve_keystore_request.js';
import { useIframeToggle } from './useIframeToggle.js';

function getDappHostname() {
  const url = new URL(document.referrer);
  return url.hostname;
}

export default function IframeWallet() {
  const aztecAWPServer = useMemo(() => new WalletConnectAztecWalletProviderServer(), []);

  const [initialized, setInitialized] = useState<boolean>(false);

  const wasm = useContext<BarretenbergWasm>(BBWasmContext);

  const { client, keyStore, session, requests } = useWalletConnectKeyStore(aztecAWPServer);
  const { setIframeOpen } = useIframeToggle(aztecAWPServer);

  useEffect(() => {
    console.log('Handling change', initialized, requests.length > 0, !initialized || requests.length > 0);
    setIframeOpen(!initialized || requests.length > 0);
  }, [initialized, requests]);

  useEffect(() => {
    if (keyStore && client && session) {
      setInitialized(true);
      aztecAWPServer
        .initWalletProvider(
          keyStore,
          new ServerRollupProvider(new URL(process.env.ROLLUP_HOST || 'http://localhost:8081')),
          wasm,
        )
        .catch(console.error);
    }
  }, [keyStore, client, session]);

  if (!client) {
    return <div>Initializing WalletConnect...</div>;
  }

  if (!initialized) {
    return (
      <PopupTrigger
        dappHostname={getDappHostname()}
        onClick={() => {
          openPopup();
        }}
      />
    );
  }

  if (requests.length > 0) {
    const request = requests[0];
    return (
      <ApproveKeyStoreRequest
        request={request.keyStoreRequest}
        onUserResponse={approved =>
          request.deferredPromise.resolve({
            approved,
            error: approved ? '' : 'User rejected request',
          })
        }
      />
    );
  }

  return (
    <div>
      <h1>Embedded worker</h1>
      <p>Connected session: {session?.topic}</p>
    </div>
  );
}
