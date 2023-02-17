import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import { AztecKeyStore, ConstantKeyPair, RECOVERY_KEY_MESSAGE, BarretenbergWasm } from '@aztec/sdk';
import { useContext, useState } from 'react';
import { generateRecoveryKey } from '../../keystore/recoveryKey';
import { BBWasmContext } from '../../utils/wasmContext';

async function createAndExportKeyStore(recoveryKey: ConstantKeyPair, passcode: string, wasm: BarretenbergWasm) {
  const keyStore = await AztecKeyStore.create(wasm);
  const encryptedKeyStore = await keyStore.export(passcode, recoveryKey);
  return { keyStore, encryptedKeyStore: encryptedKeyStore.toString('hex') };
}

export function KeyStoreCreation(props: { onFinish: (keyStore: AztecKeyStore, encryptedKeyStore: string) => void }) {
  const wasm = useContext(BBWasmContext);
  const [recoveryKey, setRecoveryKey] = useState<ConstantKeyPair | null>(null);
  const [passcode, setPasscode] = useState<string>('');

  const signMessage = useSignMessage({
    message: RECOVERY_KEY_MESSAGE,
  });

  const account = useAccount();

  return (
    <div>
      <h1>Connect a L1 Wallet to generate the encryption key</h1>
      <h2>Connect a L1 wallet</h2>
      <ConnectButton showBalance={false} accountStatus="address" />
      <button
        disabled={!account.address || !!recoveryKey}
        onClick={() => {
          generateRecoveryKey(signMessage, wasm).then(setRecoveryKey);
        }}
      >
        Sign
      </button>
      <h2>Choose a passcode</h2>
      <input value={passcode} onChange={e => setPasscode(e.target.value)} />

      <button
        disabled={!recoveryKey || !passcode}
        onClick={() => {
          createAndExportKeyStore(recoveryKey!, passcode, wasm).then(({ keyStore, encryptedKeyStore }) =>
            props.onFinish(keyStore, encryptedKeyStore),
          );
        }}
      >
        Next
      </button>
    </div>
  );
}
