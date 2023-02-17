import { FieldStatus, Field } from '@aztec/aztec-ui';
import { useContext, useState } from 'react';
import StepCard, { NextStepResult } from '../../StepCard';
import { ToastsContext } from '../../AppCard';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ConstantKeyPair, RECOVERY_KEY_MESSAGE } from '@aztec/sdk';
import { useAccount, useSignMessage } from 'wagmi';

interface ConnectWalletProps {
  onBack?: () => void;
  generateEncryptionKey: (recoveryKey: ConstantKeyPair) => Promise<string>;
  generateRecoveryKey: (signMessage: () => Promise<`0x${string}`>) => Promise<ConstantKeyPair>;
  onFinish: (key: string) => Promise<NextStepResult>;
}

export default function ConnectWallet({
  onBack,
  onFinish,
  generateRecoveryKey,
  generateEncryptionKey,
}: ConnectWalletProps) {
  const setToasts = useContext(ToastsContext);
  const [key, setKey] = useState<string>('');
  const [reconfirmKey, setReconfirmKey] = useState<string>('');
  const [recoveryKey, setRecoveryKey] = useState<ConstantKeyPair>();

  const signMessage = useSignMessage({
    message: RECOVERY_KEY_MESSAGE,
  });
  const account = useAccount();

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
      <ConnectButton showBalance={false} accountStatus="address" />
      <button
        disabled={!account.address}
        onClick={e => {
          generateRecoveryKey(signMessage.signMessageAsync).then(setRecoveryKey);
          e.preventDefault();
        }}
      >
        Sign
      </button>
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
        onClick={async () => {
          if (recoveryKey) {
            const k = await generateEncryptionKey(recoveryKey);
            setKey(k);
            navigator.clipboard.writeText(k);
            showToast();
          }
        }}
        disabled={true}
        value={key}
        password={true}
        status={key.length > 0 ? FieldStatus.Success : recoveryKey ? undefined : FieldStatus.Warning}
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
