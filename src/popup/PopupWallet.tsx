import { useContext, useEffect, useState } from 'react';
import { AppProps } from '../components/appProps.js';
import { OpenKeystore } from '../components/openKeystore.js';
import { sendHandoverMessage } from './handoverSession.js';
import { getCachedEncryptedKeystore, getCachedPassword } from '../utils/sessionUtils.js';
import { AztecKeyStore, AztecBuffer, BarretenbergWasm } from '@aztec/sdk';
import { BBWasmContext } from '../utils/wasmContext.js';

export default function PopupWallet() {
  const [keyStore, setKeyStore] = useState<AztecKeyStore | null>(null);
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

  useEffect(() => {
    if (keyStore) {
      sendHandoverMessage(keyStore).catch(console.error);
    }
  }, [keyStore]);

  if (!keyStore) {
    return <OpenKeystore onKeystoreOpened={keyStore => setKeyStore(keyStore)} />;
  }

  return (
    <div>
      <h1>Connecting...</h1>
    </div>
  );
}
