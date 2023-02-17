import { AztecBuffer, AztecKeyStore } from '@aztec/sdk';
import { useContext, useState } from 'react';
import { BarretenbergWasm } from '@aztec/sdk';
import { BBWasmContext } from '../../utils/wasmContext';

async function checkSameKeystore(
  encryptionKey: string,
  passcode: string,
  keyStore: AztecKeyStore,
  wasm: BarretenbergWasm,
) {
  const openedKeyStore = await AztecKeyStore.open(AztecBuffer.from(encryptionKey, 'hex'), passcode, wasm);
  const [openedAccountKey, keyStoreAccountKey] = await Promise.all(
    [openedKeyStore, keyStore].map(ks => ks.getAccountKey()),
  );
  return openedAccountKey.getPublicKey().toString() === keyStoreAccountKey.getPublicKey().toString();
}

export function SanityCheck(props: { keyStore: AztecKeyStore; onFinish: () => void }) {
  const wasm = useContext(BBWasmContext);
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  const [passcode, setPasscode] = useState<string>('');

  return (
    <div>
      <h1>Reenter your passcode and encryption key</h1>
      <h2>Enter your encryption key</h2>
      <input onChange={e => setEncryptionKey(e.target.value)} />
      <h2>Enter your Passcode</h2>
      <input onChange={e => setPasscode(e.target.value)} />
      <br />
      <button
        onClick={() =>
          checkSameKeystore(encryptionKey, passcode, props.keyStore, wasm)
            .then(isSame => {
              if (isSame) {
                props.onFinish();
              } else {
                console.warn('Keystore does not match');
              }
            })
            .catch(console.error)
        }
      >
        Next
      </button>
    </div>
  );
}
