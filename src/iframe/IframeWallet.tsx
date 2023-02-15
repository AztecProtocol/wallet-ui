import { useState, useEffect, useContext } from 'react';
import { AppProps } from '../components/appProps.js';
import {
  AztecKeyStore,
  ServerRollupProvider,
  BarretenbergWasm,
  WalletConnectAztecWalletProviderServer,
} from '@aztec/sdk';
import { SignClient } from '@walletconnect/sign-client/dist/types/client.js';
import { createSignClient } from '../walletConnect/createSignClient.js';
import { SessionTypes } from '@walletconnect/types';
import { IFRAME_HANDOVER_TYPE, getTopic, handleHandoverMessage, openPopup, HandoverResult } from './handleHandover.js';
import { BBWasmContext } from '../utils/wasmContext.js';

export type IframeWalletMode = 'closed' | 'connect' | 'approve-proofs' | 'approve-proof-inputs';

export default function IframeWallet(props: AppProps) {
  const [aztecAWPServer] = useState<WalletConnectAztecWalletProviderServer>(
    new WalletConnectAztecWalletProviderServer(),
  );
  const [initialized, setInitialized] = useState<boolean>(false);

  const [walletMode, setWalletMode] = useState<IframeWalletMode>('closed');
  const [client, setClient] = useState<SignClient>();
  const [session, setSession] = useState<SessionTypes.Struct>();
  const [keyStore, setKeyStore] = useState<AztecKeyStore>();

  const wasm = useContext<BarretenbergWasm>(BBWasmContext);

  const showApproveProofsRequest = () => {};
  const showApproveProofInputsRequest = () => {};

  useEffect(() => {
    async function init() {
      const client = await createSignClient(true);
      setClient(client);
      aztecAWPServer.setClient(client);
      const cachedSession = client.session.getAll().find(({ topic }) => topic === getTopic());
      if (cachedSession) {
        setSession(cachedSession);
      }
    }
    init().catch(console.error);
  }, []);

  useEffect(() => {
    if (client) {
      const { handoverPromise, removeListener } = addHandoverMessageListener(client);
      handoverPromise.then(({ keyStore, session }) => {
        console.log('GET', keyStore);
        setKeyStore(keyStore);
        setSession(session);
      });
      return removeListener;
    }
    return () => {};
  }, [client]);

  useEffect(() => {
    if (walletMode === 'connect') {
      // Sending the open iframe soon after IFRAME_READY makes it not to be listened :/
      setTimeout(() => {
        console.log('requesting open');
        aztecAWPServer.openIframe().catch(console.error);
      }, 500);
    } else if (walletMode === 'approve-proofs') {
      aztecAWPServer.openIframe().catch(console.error);
    } else if (walletMode === 'approve-proof-inputs') {
      aztecAWPServer.openIframe().catch(console.error);
    } else if (walletMode === 'closed') {
      aztecAWPServer.closeIframe().catch(console.error);
    }
  }, [walletMode]);

  useEffect(() => {
    if (client && session && keyStore) {
      setInitialized(true);
      setWalletMode('connect');
      aztecAWPServer
        .initWalletProvider(
          keyStore,
          new ServerRollupProvider(new URL(process.env.ROLLUP_HOST || 'http://localhost:8081')),
          wasm,
        )
        .catch(console.error);
    }
  }, [client, keyStore, session]);

  if (!client) {
    return <div>Initializing WalletConnect...</div>;
  }

  if (!initialized) {
    return (
      <div>
        {walletMode !== 'closed' ? (
          <button
            onClick={() =>
              openPopup(
                () => setWalletMode('connect'),
                () => setWalletMode('closed'),
              )
            }
          >
            Connect
          </button>
        ) : (
          'Connecting...'
        )}
      </div>
    );
  }

  return (
    <div>
      Last wallet mode: {walletMode}
      <h1>Embedded worker</h1>
      <p>Connected session: {session?.topic}</p>
    </div>
  );
}

function addHandoverMessageListener(client: SignClient) {
  console.log('ADD');
  // TODO when to reject?
  let handoverPromiseResolve: (result: HandoverResult) => void;
  const handoverPromise = new Promise<HandoverResult>(resolve => (handoverPromiseResolve = resolve));
  const handler = async (event: MessageEvent<any>) => {
    if (event.origin === window.location.origin) {
      switch (event.data.type) {
        case IFRAME_HANDOVER_TYPE:
          console.log('GET', IFRAME_HANDOVER_TYPE);
          handoverPromiseResolve(await handleHandoverMessage(event.data.payload, client));
          break;
        default:
          console.log('Unknown message', event.data);
      }
    }
  };
  window.addEventListener('message', handler);
  return { handoverPromise, removeListener: () => window.removeEventListener('message', handler) };
}
