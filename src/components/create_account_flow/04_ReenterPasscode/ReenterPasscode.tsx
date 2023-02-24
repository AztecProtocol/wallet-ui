import { Field, FieldStatus } from '@aztec/aztec-ui';
import { useState } from 'react';
import StepCard, { NextStepResult } from '../../StepCard';

interface ReenterPasscodeProps {
  isSameAztecKey: (aztecKey: string) => boolean;
  isSamePasscode: (password: string) => boolean;
  onBack?: () => void;
  onFinish: (encryptionKey: string, password: string) => Promise<NextStepResult>;
}
export default function ReenterPasscode({ onBack, isSameAztecKey, isSamePasscode, onFinish }: ReenterPasscodeProps) {
  const [aztecKey, setAztecKey] = useState('');
  const [password, setPassword] = useState('');

  return (
    <StepCard
      header="Re-enter your Passcode and Aztec Key"
      steps={5}
      currentStep={4}
      subtitle="Confirm your details before proceeding."
      nextButtonDisabled={!isSamePasscode(password) || !isSameAztecKey(aztecKey)}
      handlePreviousStep={onBack}
      handleNextStep={() => onFinish(aztecKey, password)}
    >
      <input
        type="text"
        id="username"
        name="username"
        autoComplete="username"
        value="Aztec Key"
        readOnly
        style={{ position: 'fixed', top: '-50px', left: 0 }}
      />
      <Field
        value={aztecKey}
        password={true}
        autoComplete="current-password"
        label="Re-enter your Aztec Key"
        placeholder="Enter aztec key"
        onChangeValue={setAztecKey}
        status={isSameAztecKey(aztecKey) ? FieldStatus.Success : undefined}
      />
      <Field
        value={password}
        password={true}
        autoComplete="off"
        label="Re-enter your Passcode"
        placeholder="Enter passcode"
        onChangeValue={setPassword}
        status={isSamePasscode(password) ? FieldStatus.Success : undefined}
      />
    </StepCard>
  );
}
