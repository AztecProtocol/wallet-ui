import { AztecBuffer, AztecKeyStore, BarretenbergWasm } from '@ludamad-aztec/sdk';
import { useContext, useState } from 'react';
import { getCachedEncryptedKeystore } from '../utils/sessionUtils.js';
import { BBWasmContext } from '../utils/wasmContext.js';
import { SignIn } from '../components/sign_in/index.js';

export interface OpenWalletProps {
  onCreateAccount: () => void;
  onKeyStoreOpened: (keyStore: AztecKeyStore, encryptedKeystore: string) => void;
}

export default function OpenWallet(props: OpenWalletProps) {
  const [cachedEncryptedKeystore, setCachedEncryptedKeystore] = useState<string | null>(getCachedEncryptedKeystore());
  const wasm = useContext<BarretenbergWasm>(BBWasmContext);

  return (
    <SignIn
      showEncryptedKeystore={!cachedEncryptedKeystore}
      showCreate={!cachedEncryptedKeystore}
      isValidPasscode={function (passcode: string): boolean {
        return passcode.length > 0; // TODO
      }}
      onCreateAccount={props.onCreateAccount}
      onChangeAccount={() => setCachedEncryptedKeystore(null)}
      onFinish={async function (userInputEncryptedKeystore: string, passcode: string) {
        try {
          const encryptedKeystore = cachedEncryptedKeystore || userInputEncryptedKeystore;
          const keyStore = await AztecKeyStore.open(AztecBuffer.from(encryptedKeystore, 'hex'), passcode, wasm, []);
          props.onKeyStoreOpened(keyStore, encryptedKeystore);
        } catch (error: any) {
          return { error: error.toString() };
        }
      }}
    />
  );
}
