import { AztecBuffer, AztecKeyStore, BarretenbergWasm } from '@aztec/sdk';
import { useContext, useEffect, useState } from 'react';
import { createNamespace, extractAndStoreSession, WalletConnectProposal } from './useWalletConnectServer.js';
import { getCachedEncryptedKeystore, getCachedPassword } from '../utils/sessionUtils.js';
import { SessionTypes } from '@walletconnect/types';
import { BBWasmContext } from '../utils/wasmContext.js';
import { AztecChainId } from '../utils/config.js';
import { SignIn } from '../components/sign_in/index.js';
import { Connect } from '../components/connect/connect.js';
import { SignClient } from '@walletconnect/sign-client/dist/types/client.js';

export interface OpenWalletProps {
  aztecChainId: AztecChainId;
  client: SignClient;
  onCreateAccount: () => void;
  proposal: WalletConnectProposal;
}

export default function OpenWallet(props: OpenWalletProps) {
  const [keyStore, setKeyStore] = useState<AztecKeyStore | null>(null);
  const [session, setSession] = useState<SessionTypes.Struct | null>(null);
  const [cachedEncryptedKeystore] = useState<string | null>(getCachedEncryptedKeystore());
  const wasm = useContext<BarretenbergWasm>(BBWasmContext);

  useEffect(() => {
    if (session) {
      extractAndStoreSession(props.client, session)
        .then(() => window.close())
        .catch(console.error);
    }
  }, [session]);

  if (!keyStore) {
    return (
      <SignIn
        initialEncryptedKeystore={cachedEncryptedKeystore}
        showCreate={true}
        isValidPasscode={function (passcode: string): boolean {
          return passcode.length > 0; // TODO
        }}
        onCreateAccount={props.onCreateAccount}
        onFinish={async function (encryptedKeystore: string, passcode: string) {
          try {
            const keyStore = await AztecKeyStore.open(AztecBuffer.from(encryptedKeystore, 'hex'), passcode, wasm, []);
            setKeyStore(keyStore);
          } catch (error: any) {
            return { error: error.toString() };
          }
        }}
      />
    );
  }

  return (
    <Connect
      dappName={props.proposal.params.proposer.metadata.name}
      dappLogoUrl={props.proposal.params.proposer.metadata.icons[0]}
      onUserResponse={async accepted => {
        if (accepted) {
          const account = (await keyStore!.getAccountKey()).getPublicKey();
          const namespaces = createNamespace(props.aztecChainId, account);

          const { acknowledged } = await props.client.approve({
            id: props.proposal.id,
            namespaces,
          });

          const session = await acknowledged();
          setSession(session);
        } else {
          await props.client.reject({
            id: props.proposal.id,
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
