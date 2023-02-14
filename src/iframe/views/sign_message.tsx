import { GrumpkinAddress } from '@aztec/sdk';
import { useState } from 'react';
import { default as styled } from 'styled-components';

interface SignMessageProps {
  reqId: string;
  message: string;
  spendingKeys: GrumpkinAddress[];
}

export function SignMessage({ reqId, message, spendingKeys }: SignMessageProps) {
  const [spendingKey, setSpendingKey] = useState(spendingKeys[0]);
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <form spellCheck="false">
        <div>Allow the dApp to use your Aztec Spending Key to sign the following message:</div>
        <div>
          <div>{message}</div>
        </div>
        <div>
          Signed by spending key:
          {/* <select
            value={spendingKey.toString()}
            onChange={e => setSpendingKey(spendingKeys.find(k => k.toString() === e.target.value)!)}
          >
            {spendingKeys.map(k => (
              <option key={k.toShortString()} value={k.toString()}>
                {k.toShortString()}
              </option>
            ))}
          </select> */}
        </div>
        <div>
          <button
            type="button"
            value="Confirm"
            disabled={busy}
            onClick={() => {
              // setBusy(true);
              // db.updateRequestData(reqId, spendingKey.toBuffer());
            }}
          ></button>
        </div>
      </form>
    </div>
  );
}
