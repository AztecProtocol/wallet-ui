import { useContext, useEffect, useMemo, useState } from 'react';
import { sendHandoverMessage, getSessionToHandover, isRequestedKeyStore } from './handoverSession.js';
import { getCachedEncryptedKeystore, getCachedPassword } from '../utils/sessionUtils.js';
import { AztecKeyStore, AztecBuffer, BarretenbergWasm } from '@aztec/sdk-incubator';
import { BBWasmContext } from '../utils/wasmContext.js';
import { SignIn } from '../components/sign_in/sign_in.js';
import { SessionTypes } from '@walletconnect/types';
import { ApprovalDialog } from '../components/approval_dialog/approval_dialog.js';

export default function PopupWallet() {
  const [keyStore, setKeyStore] = useState<AztecKeyStore | null>(null);
  const [sessionToHandover] = useState<SessionTypes.Struct | undefined>(getSessionToHandover()?.session);
  const cachedEncryptedKeys = useMemo(() => getCachedEncryptedKeystore(), []);

  const wasm = useContext<BarretenbergWasm>(BBWasmContext);

  useEffect(() => {
    const cachedPassword = getCachedPassword();
    if (cachedEncryptedKeys && cachedPassword) {
      AztecKeyStore.open(AztecBuffer.from(cachedEncryptedKeys, 'hex'), cachedPassword, wasm, [])
        .then((keyStore: AztecKeyStore) => {
          setKeyStore(keyStore);
        })
        .catch(console.warn);
    }
  }, []);

  if (sessionToHandover) {
    if (!keyStore) {
      return (
        <SignIn
          showEncryptedKeystore={!cachedEncryptedKeys}
          showCreate={false}
          showForgot={false}
          isValidPasscode={function (passcode: string): boolean {
            return passcode.length > 0; // TODO
          }}
          onCreateAccount={() => {}}
          onFinish={async function (encryptedKeys: string, passcode: string) {
            try {
              const encryptedKeystore = cachedEncryptedKeys || encryptedKeys;
              const keyStore = await AztecKeyStore.open(AztecBuffer.from(encryptedKeystore, 'hex'), passcode, wasm, []);
              if (!(await isRequestedKeyStore(keyStore))) {
                throw new Error('Incorrect account');
              }
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
