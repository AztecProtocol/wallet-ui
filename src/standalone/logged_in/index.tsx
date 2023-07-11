import style from './logged_in.module.scss';
import { getAztecChainId } from '../../utils/config';
import { AcceptProposal } from './acceptProposal';
import { applyUriIfNecessary, useWalletConnectUri } from './walletConnectPairing';
import { Button, ButtonSize, ButtonTheme, CardHeaderSize, Field, ProgressIndicator, Section } from '@aztec/aztec-ui';
import { ApproveTransaction } from '../../components/approve_transaction';
import { Web3Wallet } from '@walletconnect/web3wallet/dist/types/client';
import { init, parseCredentialPubKey, sign } from '../../tpm/tpm_sign';
import { useEffect, useState } from 'react';

export interface LoggedInProps {
  creds: any;
  client: Web3Wallet;
}

function renderSessions(sessions: any, disconnect: any) {
  const sessionsLength = Object.keys(sessions);
  if (!sessionsLength) {
    return <div>No dapp sessions.</div>;
  } else {
    return (
      <div>
        {Object.keys(sessions).map(k => {
          const { name, description, url } = sessions[k].peer.metadata;
          return (
            <Section key={sessions[k].topic}>
              <div className={style.session}>
                <h3>
                  <b>{name}</b>
                </h3>
                <h3>{url}</h3>
                <p>{description}</p>
                <Button
                  onClick={async () => {
                    await disconnect(sessions[k].topic);
                  }}
                  size={ButtonSize.Small}
                  text={'Disconnect'}
                ></Button>
              </div>
            </Section>
          );
        })}
      </div>
    );
  }
}

export default function LoggedIn(props: LoggedInProps) {
  const [proposal, setProposal] = useState();
  const [sessions, setSessions] = useState(props.client.session.getAll());
  const [requests, setRequests] = useState(props.client.getPendingSessionRequests());

  useEffect(client => {
    props.client.on('session_proposal', async proposal => {
      console.log({ proposal });
      setProposal(proposal);
      setSessions(props.client.session.getAll());
    });

    props.client.on('session_request', async request => {
      console.log({ request });
      setRequests([request]);
    });

    props.client.on('session_event', async request => {
      console.log({ request });
      setSessions(props.client.session.getAll());
      setRequests([request]);
    });
  }, []);
  if (proposal) {
    return (
      <AcceptProposal
        aztecChainId={getAztecChainId()}
        client={props.client}
        proposal={proposal}
        setProposal={setProposal}
        creds={props.creds}
      />
    );
  }
  // const requests = [];
  if (requests.length > 0) {
    const request = requests[0];

    return (
      <div>
        <ApproveTransaction
          request={request.params.request}
          onUserResponse={async approved => {
            if (approved) {
              const { signature, x, y, clientDataJson, authData, challenge } = await sign(
                props.creds,
                request.params.request.params[0],
              );
              const response = {
                id: request.id,
                result: { signature, x, y, clientDataJson, authData, challenge },
                jsonrpc: '2.0',
              };
              console.log({ response, request });
              await props.client.respond({
                topic: request.topic,
                response: response,
              });
              setRequests([]);
            }
          }}
        />
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className={style.logged}>
        <h1>Logged In To Touch Wallet</h1>
        <hr />
        <h3>
          <b>Credential Id:</b> {props.creds.credId}
        </h3>
        <h3>
          <b>Public Key:</b> {props.creds.pubKey.toString('hex')}
        </h3>
        <h3>
          <b>Sign Count:</b> {props.creds.counter}
        </h3>
        <hr />
        <br></br>
        {renderSessions(sessions, async s => {
          await props.client.engine.deleteSession(s);
          setSessions(props.client.session.getAll());
        })}
        {!sessions.length && (
          <Button
            className={style.nextButton}
            theme={ButtonTheme.Primary}
            disabled={false}
            onClick={async () => {
              const uri = new URLSearchParams(window.location.search).get('uri');
              const symKey = new URLSearchParams(window.location.search).get('symKey');

              const fullUri = `${uri}&symKey=${symKey}`;
              console.log({ fullUri });
              await props.client.core.pairing.pair({ uri: fullUri });
              setSessions(props.client.session.getAll());
            }}
            text="Connect Dapp"
          />
        )}
      </div>
    );
  }
}
