import createDebug from 'debug';
import { useState } from 'react';
import { PrivKeyResolver } from '../../keystore/UIKeyStore.js';
import styled from 'styled-components';
const debug = createDebug('aztec:wallet-ui:create_spending_key');

interface CreateSpendingKeyProps {
  privKeyResolve: PrivKeyResolver;
}

export function CreateSpendingKey({ privKeyResolve }: CreateSpendingKeyProps) {
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <form spellCheck="false">
        <div>Please connect your wallet and sign a message to generate your Aztec Spending Key.</div>
        <div>
          <button
            type="button"
            value="metamask"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              try {
                // TODO
              } catch (err: any) {
                debug(err.message);
              }
              setBusy(false);
            }}
          ></button>
        </div>
      </form>
    </div>
  );
}
