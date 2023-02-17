import { useContext, useEffect, useState } from 'react';
import { sendHandoverMessage, getSessionToHandover } from './handoverSession.js';
import { getCachedEncryptedKeystore, getCachedPassword } from '../utils/sessionUtils.js';
import { AztecKeyStore, AztecBuffer, BarretenbergWasm } from '@aztec/sdk';
import { BBWasmContext } from '../utils/wasmContext.js';
import { SignIn } from '../components/sign_in/sign_in.js';
import { SessionTypes } from '@walletconnect/types';
import { ApprovalDialog } from '../components/approval_dialog/approval_dialog.js';

export default function PopupWallet() {
  const [keyStore, setKeyStore] = useState<AztecKeyStore | null>(null);
  const [sessionToHandover] = useState<SessionTypes.Struct | undefined>(getSessionToHandover()?.session);
  const [encryptedKeys] = useState(getCachedEncryptedKeystore());

  const wasm = useContext<BarretenbergWasm>(BBWasmContext);

  useEffect(() => {
    const cachedEncryptedKeystore = getCachedEncryptedKeystore();
    const cachedPassword = getCachedPassword();
    if (cachedEncryptedKeystore && cachedPassword) {
      AztecKeyStore.open(AztecBuffer.from(cachedEncryptedKeystore, 'hex'), cachedPassword, wasm, [])
        .then((keyStore: AztecKeyStore) => {
          setKeyStore(keyStore);
        })
        .catch(console.warn);
    }
  }, []);

  if (sessionToHandover && encryptedKeys) {
    if (!keyStore) {
      return (
        <SignIn
          dappName={sessionToHandover.peer.metadata.name}
          dappLogoUrl={sessionToHandover.peer.metadata.icons[0]}
          isValidPasscode={function (passcode: string): boolean {
            return passcode.length > 0; // TODO
          }}
          onLoginWithDifferentAccount={() => {}}
          onFinish={async function (passcode: string) {
            try {
              const keyStore = await AztecKeyStore.open(AztecBuffer.from(encryptedKeys, 'hex'), passcode, wasm, []);
              setKeyStore(keyStore);
            } catch (error: any) {
              return { error: error.toString() };
            }
          }}
        />
      );
    } else {
      return (
        <ApprovalDialog
          dappLogoUrl={sessionToHandover.peer.metadata.icons[0]}
          permissions={
            <ul>
              <li>View your aztec address</li>
              <li>View your wallet assets</li>
            </ul>
          }
          cardHeader={`Connect to ${sessionToHandover.peer.metadata.name}`}
          title={`${sessionToHandover.peer.metadata.name} wants to view your assets & wallet balance`}
          onUserResponse={async approved => {
            await sendHandoverMessage(approved ? keyStore : null);
          }}
        />
      );
    }
  }

  return null;
}
