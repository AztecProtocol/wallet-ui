import { AztecKeyStore, AztecSdk } from '@aztec/sdk';
import { useEffect, useState } from 'react';
import { RegisterAccount } from './registerAccount';
import { RecoveryKit } from './recoveryKit';
import { SanityCheck } from './sanityCheck';
import { createSdk } from '../../utils/createAztecSdk';
import { KeyStoreCreation } from './keyStoreCreation';
import { AliasSelection } from './aliasSelection';

type OnboardingStep = 'keystoreCreation' | 'aliasSelection' | 'recoveryKit' | 'sanityCheck' | 'registerAccount';

export interface OnboardingProps {
  onAccountCreated: () => void;
  chainId: number;
}

export default function Onboarding(props: OnboardingProps) {
  const [sdk, setSdk] = useState<AztecSdk | null>(null);
  const [userAlias, setUserAlias] = useState<string>('');
  const [keyStore, setKeyStore] = useState<AztecKeyStore | null>();
  const [encryptedKeyStore, setEncryptedKeyStore] = useState<string | null>();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('keystoreCreation');

  useEffect(() => {
    createSdk(props.chainId).then(async sdk => {
      await sdk.run();
      setSdk(sdk);
    });
  }, []);

  if (!sdk) {
    return <div>Starting the SDK...</div>;
  }

  switch (currentStep) {
    case 'keystoreCreation':
      return (
        <KeyStoreCreation
          onFinish={(keyStore, encryptedKeyStore) => {
            setKeyStore(keyStore);
            setEncryptedKeyStore(encryptedKeyStore);
            setCurrentStep('aliasSelection');
          }}
        />
      );
    case 'aliasSelection':
      return (
        <AliasSelection
          sdk={sdk}
          encryptedKeyStore={encryptedKeyStore!}
          onFinish={userAlias => {
            setUserAlias(userAlias);
            setCurrentStep('recoveryKit');
          }}
        />
      );
    case 'recoveryKit':
      return <RecoveryKit keyStore={keyStore!} userAlias={userAlias} onFinish={() => setCurrentStep('sanityCheck')} />;
    case 'sanityCheck':
      return <SanityCheck keyStore={keyStore!} onFinish={() => setCurrentStep('registerAccount')} />;
    case 'registerAccount':
      return (
        <RegisterAccount
          sdk={sdk}
          keyStore={keyStore!}
          userAlias={userAlias}
          onFinish={() => props.onAccountCreated()}
        />
      );
  }
}
