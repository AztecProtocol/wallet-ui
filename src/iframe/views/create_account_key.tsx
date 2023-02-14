import { useWeb3React } from '@web3-react/core';
import createDebug from 'debug';
import { useState } from 'react';
import { PrivKeyResolver } from '../../keystore/UIKeyStore.js';

const debug = createDebug('aztec:wallet-ui:create_account_key');

interface CreateAccountKeyProps {
  privKeyResolve: PrivKeyResolver;
}

export function CreateAccountKey({ privKeyResolve }: CreateAccountKeyProps) {
  const [busy, setBusy] = useState(false);
  const { library: provider, activate, account } = useWeb3React();

  return (
    <div>
      <form spellCheck="false">
        <div>Please connect your wallet and sign a message to generate your Aztec Privacy Key.</div>
        <div>
          <input
            type="button"
            value="wallet connect"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              // TODO
              setBusy(false);
            }}
          ></input>
        </div>
        <div>
          <input
            type="button"
            value="metamask"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              // TODO
              setBusy(false);
            }}
          ></input>
        </div>
      </form>
    </div>
  );
}
