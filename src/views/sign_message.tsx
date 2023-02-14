import { GrumpkinAddress } from '@aztec/sdk';
import { useState } from 'react';
import { default as styled } from 'styled-components';
import { Database } from '../database/index.js';

const Root = styled.div`
  display: flex;
  align-items: center;
  margin: 5px;
`;

const Col = styled.div`
  margin: 5px;
`;

const Message = styled.div`
  padding: 5px;
  background: #dadada;
`;

const Button = styled.input`
  margin: 5px 0;
`;

interface SignMessageProps {
  db: Database;
  reqId: string;
  message: string;
  spendingKeys: GrumpkinAddress[];
}

export function SignMessage({ db, reqId, message, spendingKeys }: SignMessageProps) {
  const [spendingKey, setSpendingKey] = useState(spendingKeys[0]);
  const [busy, setBusy] = useState(false);

  return (
    <Root>
      <form spellCheck="false">
        <Col>Allow the dApp to use your Aztec Spending Key to sign the following message:</Col>
        <Col>
          <Message>{message}</Message>
        </Col>
        <Col>
          Signed by spending key:
          <select
            value={spendingKey.toString()}
            onChange={e => setSpendingKey(spendingKeys.find(k => k.toString() === e.target.value)!)}
          >
            {spendingKeys.map(k => (
              <option key={k.toShortString()} value={k.toString()}>
                {k.toShortString()}
              </option>
            ))}
          </select>
        </Col>
        <Col>
          <Button
            type="button"
            value="Confirm"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              db.updateRequestData(reqId, spendingKey.toBuffer());
            }}
          ></Button>
        </Col>
      </form>
    </Root>
  );
}
