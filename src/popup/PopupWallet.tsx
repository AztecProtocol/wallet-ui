import { useEffect, useState } from "react";
import { AppProps } from "../components/appProps.js";
import { OpenKeystore } from "../components/openKeystore.js";
import { sendHandoverMessage } from "./handoverSession.js";
import {
  getCachedEncryptedKeystore,
  getCachedPassword,
} from "../utils/sessionUtils.js";
import { AztecKeyStore, AztecBuffer } from "@aztec/sdk";

export default function PopupWallet(props: AppProps) {
  const [keyStore, setKeyStore] = useState<AztecKeyStore | null>(null);

  useEffect(() => {
    const cachedEncryptedKeystore = getCachedEncryptedKeystore();
    const cachedPassword = getCachedPassword();
    if (cachedEncryptedKeystore && cachedPassword) {
      AztecKeyStore.open(
        AztecBuffer.from(cachedEncryptedKeystore, "hex"),
        cachedPassword,
        props.wasm,
        []
      )
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
    return (
      <OpenKeystore
        wasm={props.wasm}
        onKeystoreOpened={(keyStore) => setKeyStore(keyStore)}
      />
    );
  }

  return (
    <div>
      <h1>Connecting...</h1>
    </div>
  );
}
