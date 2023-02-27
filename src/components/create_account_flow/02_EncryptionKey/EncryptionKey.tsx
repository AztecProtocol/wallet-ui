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
      subtitle="You will need this alongside your passcode to access your Wallet in future. You will be prompted to save this in the browser on advancing to the next step."
      currentStep={2}
      steps={5}
      handlePreviousStep={onBack}
      handleNextStep={async () => {
        try {
          await navigator.credentials.store(
            new PasswordCredential({
              id: 'Aztec Key',
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
        // If a password manager triggers, it's best to have 'Aztec Key' as the context username
        type="text"
        id="username"
        name="username"
        autoComplete="username"
        value="Aztec Key"
        readOnly
        style={{ position: 'fixed', top: '-50px', left: 0 }}
      />
      <Field
        // Note: Firefox does not allow clicking disabled inputs,
        // so we use userSelect: none
        // Since we set value in react, it is already functionally disabled
        style={{ userSelect: 'none' }}
        label="Your auto-generated Aztec Key"
        onClick={async () => {
          navigator.clipboard.writeText(encryptedKeyStore);
          showToast();
        }}
        value={encryptedKeyStore}
        password={true}
        autoComplete="new-password"
      />
      <p>
        The Aztec Key can be opened with your passcode. <br />
        You can store them in the browser's password manager or another secure location.
      </p>
    </StepCard>
  );
}
