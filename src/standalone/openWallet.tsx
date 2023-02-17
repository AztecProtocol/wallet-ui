import { AztecBuffer, AztecKeyStore, BarretenbergWasm } from '@aztec/sdk';
import { useContext, useEffect, useState } from 'react';
import { createNamespace, useWalletConnectServer, extractAndStoreSession } from './useWalletConnectServer.js';
import { getCachedPassword } from '../utils/sessionUtils.js';
import { SessionTypes } from '@walletconnect/types';
import { BBWasmContext } from '../utils/wasmContext.js';
import { AztecChainId } from '../utils/config.js';
import { SignIn } from '../components/sign_in/index.js';
import { Connect } from '../components/connect/connect.js';

export interface OpenWalletProps {
  aztecChainId: AztecChainId;
  onCreateAccount: () => void;
  encryptedKeystore: string;
}

export default function OpenWallet(props: OpenWalletProps) {
  const [keyStore, setKeyStore] = useState<AztecKeyStore | null>(null);
  const [session, setSession] = useState<SessionTypes.Struct | null>(null);
  const [proposal, setProposal] = useState<number | null>(null);
  const wasm = useContext<BarretenbergWasm>(BBWasmContext);

  const {
    client,
    initError: wcInitError,
    init: wcInit,
  } = useWalletConnectServer({
    onSessionProposal: proposal => {
      setProposal(proposal.id);
    },
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

  if (proposal && keyStore) {
    return (
      <Connect
        onUserResponse={async accepted => {
          if (accepted) {
            const account = (await keyStore!.getAccountKey()).getPublicKey();
            const namespaces = createNamespace(props.aztecChainId, account);

            const { acknowledged } = await client.approve({
              id: proposal!,
              namespaces,
            });

            const session = await acknowledged();
            setSession(session);
          } else {
            await client.reject({
              id: proposal!,
              reason: {
                code: 4001,
                message: 'User rejected session proposal',
              },
            });
            window.close();
          }
        }}
      />
    );
  }

  return null;
}
