import { useState, useEffect, useContext } from 'react';
import { AppProps } from '../components/appProps.js';
import { BarretenbergWasm, ServerRollupProvider, WalletConnectAztecWalletProviderServer } from '@aztec/sdk';
import { openPopup } from './handleHandover.js';
import useWalletConnectKeyStore from './useWalletConnectKeyStore.js';
import { BBWasmContext } from '../utils/wasmContext.js';
import { PopupTrigger } from '../components/popup_trigger/popup_trigger.js';

function getDappHostname() {
  const url = new URL(document.referrer);
  return url.hostname;
}

export default function IframeWallet(props: AppProps) {
  const [aztecAWPServer] = useState<WalletConnectAztecWalletProviderServer>(
    new WalletConnectAztecWalletProviderServer(),
  );
  const [initialized, setInitialized] = useState<boolean>(false);
  const wasm = useContext<BarretenbergWasm>(BBWasmContext);

  const showApproveProofsRequest = async (): Promise<{ approved: boolean; error: string }> => {
    console.log('showApproveProofsRequest TODO');
    return Promise.resolve({ approved: true, error: '' });
  };
  const showApproveProofInputsRequest = async (): Promise<{ approved: boolean; error: string }> => {
    console.log('showApproveProofInputsRequest TODO');
    return Promise.resolve({ approved: true, error: '' });
  };
  const { client, keyStore, session } = useWalletConnectKeyStore(
    aztecAWPServer,
    showApproveProofsRequest,
    showApproveProofInputsRequest,
  );

  useEffect(() => {
    if (!initialized) {
      // Sending the open iframe soon after IFRAME_READY makes it not to be listened :/
      setTimeout(() => {
        console.log('requesting open');
        aztecAWPServer.openIframe().catch(console.error);
      }, 500);
    } else {
      aztecAWPServer.closeIframe().catch(console.error);
    }
  }, [initialized]);

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

  return (
    <div>
      <h1>Embedded worker</h1>
      <p>Connected session: {session?.topic}</p>
    </div>
  );
}
