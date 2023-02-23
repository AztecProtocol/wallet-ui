import { Field } from '@aztec/aztec-ui';
import { useState } from 'react';
import StepCard, { NextStepResult } from '../../StepCard';

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
      header="Re-enter your Passcode and Aztec Key"
      steps={5}
      currentStep={4}
      subtitle="Confirm your details before proceeding - Password manager etc etc"
      nextButtonDisabled={!isSamePasscode(password)}
      handlePreviousStep={onBack}
      handleNextStep={() => onFinish(encryptionKey, password)}
    >
      <Field
        value={password}
        password={true}
        label="Re-enter your Passcode"
        placeholder="Enter passcode"
        onChangeValue={setPassword}
      />
      <Field
        value={encryptionKey}
        password={true}
        label="Re-enter your Aztec Key"
        placeholder="Enter encryption key"
        onChangeValue={setEncryptionKey}
      />
    </StepCard>
  );
}
