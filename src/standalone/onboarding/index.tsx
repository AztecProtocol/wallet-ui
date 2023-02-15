import { AztecKeyStore } from '@aztec/sdk';
import { useContext, useEffect, useState } from 'react';
import { BBWasmContext } from '../../utils/wasmContext';
import { CreateAccount } from './createAccount';
import { RecoveryKit } from './recoveryKit';
import { SanityCheck } from './sanityCheck';

type OnboardingStep = 'recoveryKit' | 'sanityCheck' | 'createAccount';

export interface OnboardingProps {
  onAccountCreated: () => void;
  chainId: number;
}

export default function Onboarding(props: OnboardingProps) {
  const wasm = useContext(BBWasmContext);

  const [userAlias] = useState<string>('ExampleUserAlias');
  const [keyStore, setKeyStore] = useState<AztecKeyStore | null>();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('recoveryKit');

  useEffect(() => {
    AztecKeyStore.create(wasm).then(setKeyStore);
  }, []);

  if (!keyStore) {
    return <div>Autogenerating keystore...</div>;
  }

  switch (currentStep) {
    case 'recoveryKit':
      return <RecoveryKit keyStore={keyStore} userAlias={userAlias} onFinish={() => setCurrentStep('sanityCheck')} />;
    case 'sanityCheck':
      return <SanityCheck keyStore={keyStore} onFinish={() => setCurrentStep('createAccount')} />;
    case 'createAccount':
      return <CreateAccount chainId={props.chainId} onFinish={() => props.onAccountCreated()} />;
  }
}
