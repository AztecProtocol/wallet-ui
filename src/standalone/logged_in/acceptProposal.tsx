import { AztecKeyStore } from '@aztec/alpha-sdk';
import { SignClient } from '@walletconnect/sign-client/dist/types/client';
import { SessionTypes } from '@walletconnect/types';
import { useEffect, useState } from 'react';
import { Connect } from '../../components/connect';
import { AztecChainId } from '../../utils/config';
import { createNamespace, extractAndStoreSession, WalletConnectProposal } from './walletConnectPairing';

export interface AcceptProposalProps {
  aztecChainId: AztecChainId;
  client: SignClient;
  proposal: WalletConnectProposal;
  keyStore: AztecKeyStore;
}

export function AcceptProposal(props: AcceptProposalProps) {
  const [session, setSession] = useState<SessionTypes.Struct | null>(null);

  useEffect(() => {
    if (session) {
      extractAndStoreSession(props.client, session)
        .then(() => window.close())
        .catch(console.error);
    }
  }, [session]);

  return (
    <Connect
      dappName={props.proposal.params.proposer.metadata.name}
      dappLogoUrl={props.proposal.params.proposer.metadata.icons[0]}
      onUserResponse={async accepted => {
        try {
          if (accepted) {
            const account = (await props.keyStore.getAccountKey()).getPublicKey();
            const namespaces = createNamespace(props.aztecChainId, account);

            const { acknowledged } = await props.client.approve({
              id: props.proposal.id,
              namespaces,
            });

            const session = await acknowledged();
            setSession(session);
          } else {
            await props.client.reject({
              id: props.proposal.id,
              reason: {
                code: 4001,
                message: 'User rejected session proposal',
              },
            });
            window.close();
          }
        } catch (error) {
          return { error: (error as Error).toString() };
        }
      }}
    />
  );
}
