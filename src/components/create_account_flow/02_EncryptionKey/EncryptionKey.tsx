import { Field } from '@aztec/aztec-ui';
import { useContext } from 'react';
import StepCard, { NextStepResult } from '../../StepCard';
import { ToastsContext } from '../../../utils/toastsContext';

interface EncryptionKeyProps {
  onBack?: () => void;
  encryptedKeyStore: string;
  onFinish: () => Promise<NextStepResult>;
}

export default function EncryptionKey({ onBack, onFinish, encryptedKeyStore }: EncryptionKeyProps) {
  const setToasts = useContext(ToastsContext);

  const showToast = () => {
    setToasts((prevToasts: any) => [
      ...prevToasts,
      {
        text: 'Encryption key copied to clipboard.',
        key: Date.now(),
        autocloseInMs: 5e3,
        closable: true,
      },
    ]);
  };

  return (
    <StepCard
      header="Make a note of your Aztec key"
      subtitle="You will need this alongside you passcode to access your Wallet in future. You will be prompted to save this in the browser on advancing to the next step."
      currentStep={2}
      steps={5}
      handlePreviousStep={onBack}
      handleNextStep={async () => {
        try {
          await navigator.credentials.store(
            new PasswordCredential({
              id: 'Aztec key',
              password: encryptedKeyStore,
            }),
          );
        } catch (error) {
          console.warn('Error trying to store credentials', error);
        }
        return onFinish();
      }}
    >
      <input
        type="text"
        id="username"
        name="username"
        autoComplete="username"
        value="Aztec key"
        readOnly
        style={{ position: 'fixed', top: '-50px', left: 0 }}
      />
      <Field
        label="Your auto-generated Aztec Key"
        onClick={async () => {
          navigator.clipboard.writeText(encryptedKeyStore);
          showToast();
        }}
        disabled={true}
        value={encryptedKeyStore}
        password={true}
        autoComplete="new-password"
      />
    </StepCard>
  );
}
