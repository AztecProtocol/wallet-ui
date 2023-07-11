import { SignClient } from '@walletconnect/sign-client/dist/types/client.js';
import { useState, useEffect, useContext } from 'react';
import { SignClientTypes, ProposalTypes, SessionTypes } from '@walletconnect/types';
import { GrumpkinAddress, RPC_METHODS } from '@aztec/alpha-sdk';
import { storeSession } from '../../utils/sessionUtils.js';
import { AztecChainId } from '../../utils/config.js';
import { SignClientContext } from '../../walletConnect/signClientContext.js';

function getUri() {
  return new URLSearchParams(window.location.search).get('uri');
}

export type WalletConnectProposal = Omit<SignClientTypes.BaseEventArgs<ProposalTypes.Struct>, 'topic'>;

export async function applyUriIfNecessary() {
  const { client } = useContext(SignClientContext);
  const uri = getUri();
  if (uri) {
    await client.core.pairing.pair({ uri });
  }
}

export function useWalletConnectUri() {
  const { client } = useContext(SignClientContext);
  const [proposal, setProposal] = useState<WalletConnectProposal | null>(null);

  useEffect(() => {
    if (client) {
      client.on('session_proposal', async (proposal) => {
        console.log({ proposal });
        setProposal(proposal);

        // optionally show user a modal or way to reject or approve session

        // handle user approval case
        // await client.respondSessionRequest({ topic: session.topic, response });

      });



    }
  }, [client]);

  return { proposal, setProposal };
}

export function createNamespace(chainId: AztecChainId) {
  const resp = {
    aztec: {
      methods: [`aztec_authenticateTx`],
      accounts: [`aztec:${chainId}:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb`],
      events: [],
    },
  };
  console.log(resp);
  return resp;
}

export async function extractAndStoreSession(signClient: SignClient, session: SessionTypes.Struct) {
  const { self, topic } = session;
  const key = signClient.core.crypto.keychain.get(self.publicKey);

  // Await the unsubscribe first to avoid deleting the symKey too early below.
  await signClient.core.relayer.unsubscribe(topic);
  await Promise.all([
    signClient.session.delete(topic, { code: 0, message: 'Handed over' }),
    signClient.core.crypto.deleteKeyPair(self.publicKey),
    signClient.core.crypto.deleteSymKey(topic),
  ]);

  storeSession(session, key);
}
