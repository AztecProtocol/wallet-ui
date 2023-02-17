import { SignClient } from '@walletconnect/sign-client/dist/types/client.js';
import { useState, useEffect } from 'react';
import { createSignClient } from '../walletConnect/createSignClient.js';
import { SignClientTypes, ProposalTypes, SessionTypes } from '@walletconnect/types';
import { GrumpkinAddress, RPC_METHODS } from '@ludamad-aztec/sdk';
import { storeSession } from '../utils/sessionUtils.js';
import { AztecChainId } from '../utils/config.js';

function getUri() {
  return new URLSearchParams(window.location.search).get('uri');
}

export type WalletConnectProposal = Omit<SignClientTypes.BaseEventArgs<ProposalTypes.Struct>, 'topic'>;

export async function applyUriIfNecessary(client: SignClient) {
  const uri = getUri();
  if (uri) {
    await client.pair({ uri });
  }
}

export function useWalletConnectServer({
  onSessionProposal,
}: {
  onSessionProposal: (proposal: WalletConnectProposal) => void;
}) {
  const [client, setClient] = useState<SignClient | null>(null);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    if (client) {
      applyUriIfNecessary(client).catch(console.error);
    }
  }, [client]);

  async function init() {
    try {
      const client = await createSignClient(false);
      client.on('session_proposal', event => {
        onSessionProposal(event);
      });
      setClient(client);
    } catch (err) {
      setInitError(err as Error);
    }
  }

  return {
    client,
    initError,
    init,
  };
}

export function createNamespace(chainId: AztecChainId, address: GrumpkinAddress) {
  return {
    aztec: {
      methods: [],
      accounts: [`aztec:${chainId}:${address.toString()}`],
      events: RPC_METHODS,
    },
  };
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
