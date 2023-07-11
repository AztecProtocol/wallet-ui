import { useContext, useState } from 'react';
import PassKey from '../../components/create_account_flow/01_PassKey/PassKey';
import RegisteredKey from '../../components/create_account_flow/02_RegisteredKey/RegisteredKey';
import { init } from '../../tpm/tpm_sign';

export interface CreateAccountProps {
  onAccountCreated: (encryptedKeys: string) => void;
  onCancel: () => void;
}

enum Step {
  _01_PassKey,
  _02_RegisteredKey,
}

export default function CreateAccount({ onAccountCreated, onCancel }: CreateAccountProps) {
  const [currentStep, setCurrentStep] = useState(Step._01_PassKey);

  const onBack = () => setCurrentStep(currentStep - 1);
  const onNext = () => {
    setCurrentStep(currentStep + 1);
  };

  // We want to remember passcode and alias, so unmount only the visual display, not the state hooks
  const renderPasscodeAlias = () => (
    <PassKey
      mounted={currentStep === Step._01_PassKey}
      onFinish={async (passcode, alias) => {
        await init();
        onNext();
      }}
      onBack={onCancel}
    />
  );
  const renderStep = () => {
    switch (currentStep) {
      // case 1 is handled above
      case Step._02_RegisteredKey:
        return (
          <RegisteredKey
            onBack={onBack}
            onFinish={async () => {
              onAccountCreated();
              setCurrentStep(3);
            }}
          />
        );
    }
    return null;
  };

  return (
    <>
      {renderPasscodeAlias()}
      {renderStep()}
    </>
  );
}
