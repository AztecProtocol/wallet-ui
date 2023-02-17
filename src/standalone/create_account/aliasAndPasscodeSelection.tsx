import { AztecSdk } from '@aztec/sdk';
import { useState } from 'react';

async function validateAlias(sdk: AztecSdk, alias: string) {
  const isRegistered = await sdk.isAliasRegistered(alias, true);
  return !isRegistered;
}

export function AliasAndPasscodeSelection(props: {
  sdk: AztecSdk;
  encryptedKeyStore: string;
  onFinish: (userAlias: string) => void;
}) {
  const [userAlias, setUserAlias] = useState<string>('');

  return (
    <div>
      <h1>Choose an alias and save the encrypted keystore</h1>
      <h2>Encrypted keystore</h2>
      <input disabled={true} value={props.encryptedKeyStore} />
      <h2>Choose an alias</h2>
      <input value={userAlias} onChange={event => setUserAlias(event.target.value)} />
      <button
        disabled={!userAlias}
        onClick={() => {
          validateAlias(props.sdk, userAlias).then(isValid => {
            if (isValid) {
              props.onFinish(userAlias);
            }
          });
        }}
      >
        Next
      </button>
    </div>
  );
}
