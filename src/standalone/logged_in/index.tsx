import { AztecKeyStore } from '@aztec/sdk';
import { useContext } from 'react';
import { getAztecChainId } from '../../utils/config';
import { SignClientContext } from '../../walletConnect/signClientContext';
import { AcceptProposal } from './acceptProposal';
import { useWalletConnectUri } from './walletConnectPairing';

export interface LoggedInProps {
  keyStore: AztecKeyStore;
}

export default function LoggedIn(props: LoggedInProps) {
  const { client } = useContext(SignClientContext);
  const { proposal } = useWalletConnectUri();

  if (client && proposal) {
    return (
      <AcceptProposal aztecChainId={getAztecChainId()} client={client} proposal={proposal} keyStore={props.keyStore} />
    );
  }

  return <div>Waiting for WalletConnect proposal...</div>;
}
