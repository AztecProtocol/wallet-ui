// @ts-ignore
import { Field } from '@aztec/aztec-ui';
import { useState } from 'react';
import StepCard, { NextStepResult } from '../../../../components/StepCard';

interface ReenterPasscodeProps {
  isSamePasscode: (password: string) => boolean;
  onBack?: () => void;
  onFinish: (encryptionKey: string, password: string) => Promise<NextStepResult>;
}
export default function ReenterPasscode({ onBack, isSamePasscode, onFinish }: ReenterPasscodeProps) {
  const [encryptionKey, setEncryptionKey] = useState('');
  const [password, setPassword] = useState('');

  return (
    <StepCard
      header={'Re-enter your account details'}
      nextButtonDisabled={!isSamePasscode(password)}
      handlePreviousStep={onBack}
      handleNextStep={() => onFinish(encryptionKey, password)}
    >
      <Field
        value={encryptionKey}
        password={true}
        label="Re-enter your Encryption Key"
        placeholder="Enter encryption key"
        onChangeValue={setEncryptionKey}
      />
      <Field
        value={password}
        password={true}
        label="Re-enter your Passcode"
        placeholder="Enter passcode"
        onChangeValue={setPassword}
      />
    </StepCard>
  );
}
