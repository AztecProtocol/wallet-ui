import { useState, useEffect } from "react";
import { AppProps } from "../components/appProps.js";
import {
  AztecKeyStore,
  ServerRollupProvider,
  WalletConnectAztecWalletProviderServer,
} from "@aztec/sdk";
import { SignClient } from "@walletconnect/sign-client/dist/types/client.js";
import { createSignClient } from "../walletConnect/createSignClient.js";
import { SessionTypes } from "@walletconnect/types";
import {
  IFRAME_HANDOVER_TYPE,
  getTopic,
  handleHandoverMessage,
  openPopup,
} from "./handleHandover.js";

export default function IframeWallet(props: AppProps) {
  const [aztecAWPServer] = useState<WalletConnectAztecWalletProviderServer>(
    new WalletConnectAztecWalletProviderServer()
  );
  const [initialized, setInitialized] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(false);

  const [client, setClient] = useState<SignClient | null>(null);
  const [session, setSession] = useState<SessionTypes.Struct | null>(null);
  const [keyStore, setKeyStore] = useState<AztecKeyStore | null>(null);

  useEffect(() => {
    async function init() {
      const client = await createSignClient(true);
      setClient(client);
      aztecAWPServer.setClient(client);
      const cachedSession = client.session
        .getAll()
        .find(({ topic }) => topic === getTopic());
      if (cachedSession) {
        setSession(cachedSession);
      }
    }
    init().catch(console.error);
  }, []);

  useEffect(() => {
    if (client) {
      const handler = async (event: MessageEvent<any>) => {
        if (event.origin === window.location.origin) {
          switch (event.data.type) {
            case IFRAME_HANDOVER_TYPE:
              await handleHandoverMessage(
                event.data.payload,
                setKeyStore,
                setSession,
                client,
                props.wasm
              );
              break;
            default:
              console.log("Unknown message", event.data);
          }
        }
      };
      window.addEventListener("message", handler);
      return () => window.removeEventListener("message", handler);
    }
    return () => {};
  }, [client]);

  useEffect(() => {
    if (!initialized) {
      // Sending the open iframe soon after IFRAME_READY makes it not to be listened :/
      setTimeout(() => {
        console.log("requesting open");
        aztecAWPServer.openIframe().catch(console.error);
      }, 500);
    } else {
      aztecAWPServer.closeIframe().catch(console.error);
    }
  }, [initialized]);

  useEffect(() => {
    if (client && session && keyStore) {
      setInitialized(true);
      aztecAWPServer
        .initWalletProvider(
          keyStore,
          new ServerRollupProvider(
            new URL(process.env.ROLLUP_HOST || "http://localhost:8081")
          ),
          props.wasm
        )
        .catch(console.error);
    }
  }, [client, keyStore, session]);

  if (!client) {
    return <div>Initializing WalletConnect...</div>;
  }

  if (!initialized) {
    return (
      <div>
        {!initializing ? (
          <button
            onClick={() =>
              openPopup(
                () => setInitializing(true),
                () => setInitializing(false)
              )
            }
          >
            Connect
          </button>
        ) : (
          "Connecting..."
        )}
      </div>
    );
  }

  return (
    <div>
      <h1>Embedded worker</h1>
      <p>Connected session: {session?.topic}</p>
    </div>
  );
}
