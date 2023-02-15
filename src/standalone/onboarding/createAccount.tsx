import { AztecSdk } from '@aztec/sdk';
import { useEffect, useState } from 'react';
import { createSdk } from '../../utils/createAztecSdk';
import { OnboardingStepProps } from './props';

export function CreateAccount(props: { chainId: number } & OnboardingStepProps) {
  const [sdk, setSdk] = useState<AztecSdk | null>(null);

  useEffect(() => {
    createSdk(props.chainId).then(setSdk);
  }, []);

  return (
    <div>
      <h1>Make a deposit & select a gas fee</h1>
      <h2>Deposit amount (optional)</h2>
      <input />
      <h2>Gas fee</h2>
      <input />
      <br />
      <button onClick={() => props.onFinish()}>Deposit and create wallet</button>
    </div>
  );
}
