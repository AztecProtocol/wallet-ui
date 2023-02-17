import { AztecBuffer, AztecKeyStore, BarretenbergWasm } from '@aztec/sdk';
import { useContext, useState } from 'react';
import { getCachedEncryptedKeystore } from '../utils/sessionUtils.js';
import { BBWasmContext } from '../utils/wasmContext.js';
import { SignIn } from '../components/sign_in/index.js';

export interface OpenWalletProps {
  onCreateAccount: () => void;
  onKeyStoreOpened: (keyStore: AztecKeyStore) => void;
}

export default function OpenWallet(props: OpenWalletProps) {
  const [cachedEncryptedKeystore] = useState<string | null>(getCachedEncryptedKeystore());
  const wasm = useContext<BarretenbergWasm>(BBWasmContext);

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
          props.onKeyStoreOpened(keyStore);
        } catch (error: any) {
          return { error: error.toString() };
        }
      }}
    />
  );
}
