import { AztecKeyStore } from '@aztec/sdk';
import { useContext, useState } from 'react';
import { RegisterAccount } from './registerAccount';
import { RecoveryKit } from './recoveryKit';
import { SanityCheck } from './sanityCheck';
import { KeyStoreCreation } from './keyStoreCreation';
import { AliasSelection } from './aliasSelection';
import { AztecSdkContext } from '../../utils/aztecSdkContext';
import { EthereumChainId } from '../../utils/config';

type OnboardingStep = 'keystoreCreation' | 'aliasSelection' | 'recoveryKit' | 'sanityCheck' | 'registerAccount';

export interface OnboardingProps {
  onAccountCreated: () => void;
  chainId: EthereumChainId;
}

export default function Onboarding(props: OnboardingProps) {
  const [userAlias, setUserAlias] = useState<string>('');
  const [keyStore, setKeyStore] = useState<AztecKeyStore | null>();
  const [encryptedKeyStore, setEncryptedKeyStore] = useState<string | null>();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('keystoreCreation');

  const { sdk } = useContext(AztecSdkContext);

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
          chainId={props.chainId}
          keyStore={keyStore!}
          userAlias={userAlias}
          onFinish={() => props.onAccountCreated()}
        />
      );
  }
}
