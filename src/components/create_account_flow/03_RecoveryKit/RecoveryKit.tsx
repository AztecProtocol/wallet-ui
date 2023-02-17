import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import { AztecKeyStore, ConstantKeyPair, RECOVERY_KEY_MESSAGE } from '@aztec/sdk';
import { useContext, useState } from 'react';
import { generateRecoveryKey } from '../../../keystore/recoveryKey';
import { BBWasmContext } from '../../../utils/wasmContext';
import StepCard from '../../StepCard';

interface RecoveryKitProps {
  // userAlias: string;
  generateRecoveryKey: () => Promise<ConstantKeyPair>;
  downloadRecoveryKit: () => Promise<void>;
  onBack: () => void;
  // keyStore: AztecKeyStore;
  onFinish: (recoveryKey: ConstantKeyPair) => void;
}

export function RecoveryKit({
  // userAlias,
  generateRecoveryKey,
  downloadRecoveryKit,
  // keyStore,
  onBack,
  onFinish,
}: RecoveryKitProps) {
  const wasm = useContext(BBWasmContext);
  const [recoveryKey, setRecoveryKey] = useState<ConstantKeyPair | null>(null);

  // const signMessage = useSignMessage({
  //   message: RECOVERY_KEY_MESSAGE,
  // });

  const account = useAccount();

  return (
    <StepCard header="Back up to an L1 wallet" handlePreviousStep={onBack}>
      <h1>Back up to an L1 wallet</h1>
      <h2>Connect a L1 wallet</h2>
      <ConnectButton showBalance={false} accountStatus="address" />
      <button
        disabled={!account.address}
        onClick={() => {
          generateRecoveryKey().then(setRecoveryKey);
        }}
      >
        Sign
      </button>
      <h2>Download recovery kit</h2>
      <button
        disabled={!recoveryKey}
        onClick={() => {
          downloadRecoveryKit().then(() => onFinish(recoveryKey));
        }}
      >
        Download
      </button>
    </StepCard>
  );
}
