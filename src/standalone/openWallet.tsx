import { AztecBuffer, AztecKeyStore, BarretenbergWasm } from '@aztec/sdk';
import { useContext, useEffect, useState } from 'react';
import { createNamespace, useWalletConnectServer, extractAndStoreSession } from './useWalletConnectServer.js';
import { OpenKeystore } from '../components/openKeystore.js';
import { getCachedEncryptedKeystore, getCachedPassword } from '../utils/sessionUtils.js';
import { SessionTypes } from '@walletconnect/types';
import { BBWasmContext } from '../utils/wasmContext.js';
import { AztecChainId } from '../utils/config.js';

export interface OpenWalletProps {
  aztecChainId: AztecChainId;
  onCreateAccount: () => void;
}

export default function OpenWallet(props: OpenWalletProps) {
  const [keyStore, setKeyStore] = useState<AztecKeyStore | null>(null);
  const [session, setSession] = useState<SessionTypes.Struct | null>(null);
  const wasm = useContext<BarretenbergWasm>(BBWasmContext);

  const {
    client,
    initError: wcInitError,
    init: wcInit,
  } = useWalletConnectServer({
    onSessionProposal: async () => {
      const account = (await keyStore!.getAccountKey()).getPublicKey();
      return createNamespace(props.aztecChainId, account);
    },
    onSessionEstablished: setSession,
  });

  useEffect(() => {
    const cachedEncryptedKeystore = getCachedEncryptedKeystore();
    const cachedPassword = getCachedPassword();
    if (cachedEncryptedKeystore && cachedPassword) {
      AztecKeyStore.open(AztecBuffer.from(cachedEncryptedKeystore, 'hex'), cachedPassword, wasm, [])
        .then(keyStore => {
          setKeyStore(keyStore);
        })
        .catch(console.warn);
    }
  }, []);

  useEffect(() => {
    if (keyStore) {
      wcInit().catch(console.error);
    }
  }, [keyStore]);

  useEffect(() => {
    if (client && session) {
      extractAndStoreSession(client, session)
        .then(() => window.close())
        .catch(console.error);
    }
  }, [client, session]);

  if (!keyStore) {
    return (
      <div>
        <OpenKeystore onKeystoreOpened={setKeyStore} />
        <br />
        <button onClick={props.onCreateAccount}>Create keystore</button>
      </div>
    );
  }

  if (!client) {
    return <div>Initializing WC... {wcInitError ? wcInitError.message : ''}</div>;
  }

  return <>Keystore open!</>;
}
