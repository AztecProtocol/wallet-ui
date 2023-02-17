import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import { AztecKeyStore, ConstantKeyPair, RECOVERY_KEY_MESSAGE } from '@aztec/sdk';
import { useContext, useState } from 'react';
import { generateRecoveryKey } from '../../keystore/recoveryKey';
import { BBWasmContext } from '../../utils/wasmContext';
import { downloadRecoveryKit } from '../../keystore';

export function RecoveryKit(props: { userAlias: string; keyStore: AztecKeyStore; onFinish: () => void }) {
  const wasm = useContext(BBWasmContext);
  const [recoveryKey, setRecoveryKey] = useState<ConstantKeyPair | null>(null);

  const signMessage = useSignMessage({
    message: RECOVERY_KEY_MESSAGE,
  });

  const account = useAccount();

  return (
    <div>
      <h1>Back up to an L1 wallet</h1>
      <h2>Connect a L1 wallet</h2>
      <ConnectButton showBalance={false} accountStatus="address" />
      <button
        disabled={!account.address}
        onClick={() => {
          generateRecoveryKey(signMessage, wasm).then(setRecoveryKey);
        }}
      >
        Sign
      </button>
      <h2>Download recovery kit</h2>
      <button
        disabled={!recoveryKey}
        onClick={() => {
          downloadRecoveryKit(props.keyStore, recoveryKey!, props.userAlias).then(() => props.onFinish());
        }}
      >
        Download
      </button>
    </div>
  );
}
