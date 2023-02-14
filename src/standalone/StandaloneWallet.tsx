import { AppProps } from "../components/appProps.js";
import { AztecBuffer, AztecKeyStore } from "@aztec/sdk";
import { useEffect, useState } from "react";
import {
  createNamespace,
  useWalletConnectServer,
  extractAndStoreSession,
} from "./useWalletConnectServer.js";
import { OpenKeystore } from "../components/openKeystore.js";
import {
  getCachedEncryptedKeystore,
  getCachedPassword,
} from "../utils/sessionUtils.js";
import { SessionTypes } from "@walletconnect/types";

export default function StandaloneWallet(props: AppProps) {
  const [keyStore, setKeyStore] = useState<AztecKeyStore | null>(null);
  const [session, setSession] = useState<SessionTypes.Struct | null>(null);

  const {
    client,
    initError: wcInitError,
    init: wcInit,
  } = useWalletConnectServer({
    onSessionProposal: async () => {
      const account = (await keyStore!.getAccountKey()).getPublicKey();
      return createNamespace(props.chainId, account);
    },
    onSessionEstablished: setSession,
  });

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
        .then((keyStore) => {
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
    return <OpenKeystore wasm={props.wasm} onKeystoreOpened={setKeyStore} />;
  }

  if (!client) {
    return (
      <div>Initializing WC... {wcInitError ? wcInitError.message : ""}</div>
    );
  }

  return <>Keystore open!</>;
}
