import { WalletConnectAztecWalletProviderServer } from '@aztec/sdk';
import { SignClient } from '@walletconnect/sign-client/dist/types/client';
import { SessionTypes } from '@walletconnect/types';
import { useState, useEffect } from 'react';
import { createSignClient } from '../walletConnect/createSignClient';
import { getTopic, handleHandoverMessage, HandoverResult, IFRAME_HANDOVER_TYPE } from './handleHandover';
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
  const [client, setClient] = useState<SignClient>();
  const [session, setSession] = useState<SessionTypes.Struct>();
  const [keyStore, setKeyStore] = useState<WalletConnectKeyStore>();

  useEffect(() => {
    async function init() {
      const client = await createSignClient(true);
      setClient(client);
      aztecAWPServer.setClient(client);
      const cachedSession = client.session.getAll().find(({ topic }) => topic === getTopic());
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

  // useEffect(() => {
  //   console.log('CLIENT');
  //   if (client && !keyStore) {
  //     const { handoverPromise, removeListener } = addHandoverMessageListener(client);
  //     handoverPromise.then(({ keyStore, session }) => {
  //       console.log('kestore');

  //       setKeyStore(
  //         new WalletConnectKeyStore(
  //           keyStore,
  //           session || cachedSession,
  //           showApproveProofsRequest,
  //           showApproveProofInputsRequest,
  //         ),
  //       );
  //     });
  //     // return removeListener;
  //   }
  //   return () => {};
  // }, [client, keyStore]);
  return { client, keyStore, session };
}

// function addHandoverMessageListener(client: SignClient) {
//   // TODO when to reject?
//   let handoverPromiseResolve: (result: HandoverResult) => void;
//   const handoverPromise = new Promise<HandoverResult>(resolve => (handoverPromiseResolve = resolve));
//   const handler = async (event: MessageEvent<any>) => {
//     if (event.origin === window.location.origin) {
//       switch (event.data.type) {
//         case IFRAME_HANDOVER_TYPE:
//           handoverPromiseResolve(await handleHandoverMessage(event.data.payload, client));
//           break;
//         default:
//           console.log('Unknown message', event.data);
//       }
//     }
//   };
//   window.addEventListener('message', handler);
//   return { handoverPromise, removeListener: () => window.removeEventListener('message', handler) };
// }
