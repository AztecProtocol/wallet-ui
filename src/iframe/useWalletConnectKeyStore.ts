import { WalletConnectAztecWalletProviderServer } from '@ludamad-aztec/sdk';
import { SessionTypes } from '@walletconnect/types';
import { useState, useEffect, useContext } from 'react';
import { SignClientContext } from '../walletConnect/signClientContext';
import { getTopic, handleHandoverMessage, IFRAME_HANDOVER_TYPE } from './handleHandover';
import { WalletConnectKeyStore } from './WalletConnectKeyStore';

/**
 * Performs loading of WalletConnectKeyStore using a wallet connect handover
 * session from a popup/opened window from the popup/ folder.
 */
export default function useWalletConnectKeyStore(
  aztecAWPServer: WalletConnectAztecWalletProviderServer,
  showApproveProofsRequest: () => Promise<{ approved: boolean; error: string }>,
  showApproveProofInputsRequest: () => Promise<{ approved: boolean; error: string }>,
) {
  const { client } = useContext(SignClientContext);

  const [session, setSession] = useState<SessionTypes.Struct>();
  const [keyStore, setKeyStore] = useState<WalletConnectKeyStore>();

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
              setKeyStore(new WalletConnectKeyStore(keyStore, showApproveProofsRequest, showApproveProofInputsRequest));
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

  return { client, keyStore, session };
}
