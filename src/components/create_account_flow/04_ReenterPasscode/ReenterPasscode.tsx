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
      header="Re-enter your account details"
      nextButtonDisabled={!isSamePasscode(password) || !isSameAztecKey(aztecKey)}
      handlePreviousStep={onBack}
      handleNextStep={() => onFinish(aztecKey, password)}
    >
      <Field
        value={aztecKey}
        password={true}
        label="Re-enter your Aztec Key"
        placeholder="Enter aztec key"
        onChangeValue={setAztecKey}
        status={isSameAztecKey(aztecKey) ? FieldStatus.Success : undefined}
      />
      <Field
        value={password}
        password={true}
        label="Re-enter your Passcode"
        placeholder="Enter passcode"
        onChangeValue={setPassword}
        status={isSamePasscode(aztecKey) ? FieldStatus.Success : undefined}
      />
    </StepCard>
  );
}
