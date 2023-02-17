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
      header={'Store the encrypted keys'}
      handlePreviousStep={onBack}
      handleNextStep={async () => {
        try {
          await navigator.credentials.store(
            new PasswordCredential({
              id: 'Encrypted keys',
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
        value="Encrypted keys"
        readOnly
        style={{ position: 'fixed', top: '-50px', left: 0 }}
      />
      <Field
        label={'Encrypted keys'}
        onClick={async () => {
          navigator.clipboard.writeText(encryptedKeyStore);
          showToast();
        }}
        disabled={true}
        value={encryptedKeyStore}
        password={true}
        autoComplete="new-password"
      />
      <p>
        The encrypted keys can be opened with your passcode. <br />
        You can store them in the browser's password manager or another secure location.
      </p>
    </StepCard>
  );
}
