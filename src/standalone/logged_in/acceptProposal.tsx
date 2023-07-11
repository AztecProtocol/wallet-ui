import { SignClient } from '@walletconnect/sign-client/dist/types/client';
import { SessionTypes } from '@walletconnect/types';
import { useEffect, useState } from 'react';
import { Connect } from '../../components/connect';
import { AztecChainId } from '../../utils/config';
import { createNamespace, extractAndStoreSession, WalletConnectProposal } from './walletConnectPairing';

export interface AcceptProposalProps {
  aztecChainId: AztecChainId;
  client: any;
  proposal: WalletConnectProposal;
  creds: any;
  setProposal: any;
}

export function AcceptProposal(props: AcceptProposalProps) {
  const [session, setSession] = useState<SessionTypes.Struct | null>(null);

  useEffect(() => {
    if (session) {
      // extractAndStoreSession(props.client, session)
      //   .then(() => window.close())
      //   .catch(console.error);
    }
  }, [session]);

  return (
    <Connect
      dappName={props.proposal.params.proposer.metadata.name}
      dappLogoUrl={props.proposal.params.proposer.metadata.icons[0]}
      onUserResponse={async accepted => {
        try {
          if (accepted) {
            // const account = (await props.keyStore.getAccountKey()).getPublicKey();
            // optionally show user a modal or way to reject or approve session

            // handle user approval case

            // create the approved session with selected accounts, supported methods, chains and events for your wallet
            const session = await props.client.approve({
              id: props.proposal.id,
              namespaces: {
                aztec: {
                  accounts: ['aztec:671337:1'],
                  methods: ['aztec_authenticateTx'],
                  chains: ['aztec:671337'],
                  events: [],
                },
              },
            });

            // create response object
            const response = { id: props.proposal.id, result: 'session approved', jsonrpc: '2.0' };

            // respond to the dapp request with the approved session's topic and response
            await props.client.respond({ topic: session.topic, response });
            props.setProposal();
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
