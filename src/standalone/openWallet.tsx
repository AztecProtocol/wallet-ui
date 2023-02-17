import { AztecBuffer, AztecKeyStore, BarretenbergWasm } from '@aztec/sdk';
import { useContext, useEffect, useState } from 'react';
import { createNamespace, useWalletConnectServer, extractAndStoreSession } from './useWalletConnectServer.js';
import { OpenKeystore } from '../components/openKeystore.js';
import { getCachedEncryptedKeystore, getCachedPassword, setCachedPassword } from '../utils/sessionUtils.js';
import { SessionTypes } from '@walletconnect/types';
import { BBWasmContext } from '../utils/wasmContext.js';
import { AztecChainId } from '../utils/config.js';
import { SignIn } from '../components/sign_in/index.js';
import { NextStepResult } from '../components/StepCard/index.js';

export interface OpenWalletProps {
  aztecChainId: AztecChainId;
  onCreateAccount: () => void;
  encryptedKeystore: string;
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
    const cachedPassword = getCachedPassword();
    if (props.encryptedKeystore && cachedPassword) {
      AztecKeyStore.open(AztecBuffer.from(props.encryptedKeystore, 'hex'), cachedPassword, wasm, [])
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
      <SignIn
        isValidPasscode={function (passcode: string): boolean {
          return passcode.length > 0; // TODO
        }}
        onLoginWithDifferentAccount={props.onCreateAccount}
        onFinish={async function (passcode: string) {
          try {
            const keyStore = await AztecKeyStore.open(
              AztecBuffer.from(props.encryptedKeystore, 'hex'),
              passcode,
              wasm,
              [],
            );
            setKeyStore(keyStore);
            setCachedPassword(passcode);
          } catch (error: any) {
            return { error: error.toString() };
          }
        }}
      />
    );
  }

  if (!client) {
    return <div>Initializing WC... {wcInitError ? wcInitError.message : ''}</div>;
  }

  return <>Keystore open!</>;
}
