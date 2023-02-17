// @ts-ignore
import { FieldStatus, Field } from '@aztec/aztec-ui';
import { useContext, useState } from 'react';
import StepCard, { NextStepResult } from '../../../../components/StepCard';
import { ToastsContext } from '../../../../components/WalletApp';

interface ConnectWalletProps {
  onBack?: () => void;
  onFinish: (key: string) => Promise<NextStepResult>;
}

export default function ConnectWallet({ onBack, onFinish }: ConnectWalletProps) {
  const setToasts = useContext(ToastsContext);
  const [key, setKey] = useState<string>('');
  const [reconfirmKey, setReconfirmKey] = useState<string>('');

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
      header={'Choose Alias & Passcode'}
      nextButtonDisabled={!key || reconfirmKey !== key}
      handlePreviousStep={onBack}
      handleNextStep={() => onFinish(key)}
    >
      <input
        type="text"
        id="username"
        name="username"
        autoComplete="username"
        value="encryption_key"
        readOnly
        style={{ position: 'fixed', top: '-50px', left: 0 }}
      />
      <Field
        label={'Encryption key'}
        sublabel={key ? 'You can click on your encryption key to copy it to your clipboard.' : undefined}
        placeholder="Click here to generate your encryption key"
        onClick={() => {
          const k = 'this-is-a-test-key';
          setKey(k);
          navigator.clipboard.writeText(k);
          showToast();
        }}
        disabled={true}
        value={key}
        password={true}
        status={key.length > 0 ? FieldStatus.Success : undefined}
        autoComplete="new-password"
      />
      <Field
        label={'Confirm encryption key'}
        placeholder="Paste your encryption key here"
        onChangeValue={(value: string) => setReconfirmKey(value)}
        status={reconfirmKey.length > 0 ? (key === reconfirmKey ? FieldStatus.Success : FieldStatus.Error) : undefined}
        value={reconfirmKey}
        password={true}
        autoComplete="new-password"
      />
    </StepCard>
  );
}
