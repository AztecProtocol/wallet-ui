import { useState, useEffect, useContext, useMemo } from 'react';
import { BarretenbergWasm, ServerRollupProvider, WalletConnectAztecWalletProviderServer } from '@aztec/sdk';
import { openPopup } from './handleHandover.js';
import useWalletConnectKeyStore from './useWalletConnectKeyStore.js';
import { BBWasmContext } from '../utils/wasmContext.js';
import { PopupTrigger } from '../components/popup_trigger/popup_trigger.js';
import { ApproveTransaction } from '../components/approve_transaction';
import { useIframeToggle } from './useIframeToggle.js';
import { AztecSdkContext } from '../utils/aztecSdkContext.js';

function getDappOrigin() {
  const url = new URL(document.referrer);
  return url.origin;
}

export default function IframeWallet() {
  const aztecAWPServer = useMemo(() => new WalletConnectAztecWalletProviderServer(), []);

  const [initialized, setInitialized] = useState<boolean>(false);

  const wasm = useContext<BarretenbergWasm>(BBWasmContext);
  const { sdk } = useContext(AztecSdkContext);

  const { client, keyStore, session, requests } = useWalletConnectKeyStore(aztecAWPServer);
  const { setIframeOpen } = useIframeToggle(aztecAWPServer);

  useEffect(() => {
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
        dappOrigin={getDappOrigin()}
        onClick={() => {
          openPopup();
        }}
      />
    );
  }

  if (requests.length > 0) {
    const request = requests[0];
    if (!sdk) {
      return <div>Starting the SDK...</div>;
    }

    return (
      <ApproveTransaction
        dappOrigin={getDappOrigin()}
        request={request.transactionRequest}
        sdk={sdk}
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
