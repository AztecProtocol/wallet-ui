import { WalletConnectAztecWalletProviderServer } from '@aztec/sdk';
import { SessionTypes } from '@walletconnect/types';
import { useState, useEffect, useContext } from 'react';
import { createDeferredPromise, DeferredPromise } from '../utils/deferredPromise';
import { SignClientContext } from '../walletConnect/signClientContext';
import { getTopic, handleHandoverMessage, IFRAME_HANDOVER_TYPE } from './handleHandover';
import { TransactionRequestResponse, TransactionRequest, WalletConnectKeyStore } from './WalletConnectKeyStore';

/**
 * Performs loading of WalletConnectKeyStore using a wallet connect handover
 * session from a popup/opened window from the popup/ folder.
 */
export default function useWalletConnectKeyStore(aztecAWPServer: WalletConnectAztecWalletProviderServer) {
  const { client } = useContext(SignClientContext);

  const [session, setSession] = useState<SessionTypes.Struct>();
  const [keyStore, setKeyStore] = useState<WalletConnectKeyStore>();
  const [requests, setRequests] = useState<
    { transactionRequest: TransactionRequest; deferredPromise: DeferredPromise<TransactionRequestResponse> }[]
  >([]);

  useEffect(() => {
    if (client) {
      aztecAWPServer.setClient(client);
      const cachedSession = client.session.getAll().find(({ topic }) => topic === getTopic());
      if (cachedSession) {
        setSession(cachedSession);
      }
      const handler = async (event: MessageEvent<any>) => {
        if (event.origin === window.location.origin) {
          switch (event.data.type) {
            case IFRAME_HANDOVER_TYPE:
              const { keyStore, session } = await handleHandoverMessage(event.data.payload, client);
              if (session) {
                setSession(session);
              }
              setKeyStore(
                new WalletConnectKeyStore(keyStore, async transactionRequest => {
                  const { promise, deferredPromise } = createDeferredPromise<TransactionRequestResponse>();
                  const request = { transactionRequest, deferredPromise };

                  setRequests(requests => [...requests, request]);
                  try {
                    return await promise;
                  } finally {
                    setRequests(requests => requests.filter(r => r !== request));
                  }
                }),
              );
              break;
            default:
              console.log('Unknown message', event.data);
          }
        }
      };
      window.addEventListener('message', handler);
      return () => window.removeEventListener('message', handler);
    }
    return () => {};
  }, [client]);

  return { client, keyStore, session, requests };
}
