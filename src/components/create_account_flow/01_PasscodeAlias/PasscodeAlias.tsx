import { Field, FieldStatus } from '@aztec/aztec-ui';
import { useState } from 'react';
import StepCard, { NextStepResult } from '../../StepCard';

interface PasscodeAliasProps {
  mounted: boolean;
  // Note: leave heavier validation for onFinish
  isValidAlias: (userAlias: string) => boolean;
  isValidPasscode: (passcode: string) => boolean;
  onBack?: () => void;
  onFinish: (passcode: string, userAlias: string) => Promise<NextStepResult>;
}

export default function PasscodeAlias({
  mounted,
  isValidAlias,
  isValidPasscode,
  onBack,
  onFinish,
}: PasscodeAliasProps) {
  const [alias, setAlias] = useState('');
  const [passcode, setPasscode] = useState('');
  const [reconfirmPasscode, setReconfirmPasscode] = useState('');
  if (!mounted) {
    return null;
  }
  return (
    <StepCard
      header="Choose Alias & Passcode"
      subtitle="You will need you Passcode alongside your Aztec Key in order to log into your Wallet."
      currentStep={1}
      steps={5}
      nextButtonDisabled={!isValidAlias(alias) || !isValidPasscode(passcode) || reconfirmPasscode !== passcode}
      handlePreviousStep={onBack}
      handleNextStep={() => onFinish(passcode, alias)}
    >
      <Field
        value={alias}
        label="Choose an alias"
        status={isValidAlias(alias) ? FieldStatus.Success : undefined}
        placeholder="Enter alias"
        onChangeValue={setAlias}
      />
      <Field
        value={passcode}
        password={true}
        label="Choose a passcode"
        status={passcode.length > 0 ? FieldStatus.Success : undefined}
        placeholder="Enter passcode"
        autoComplete="new-password"
        onChangeValue={setPasscode}
      />
      <Field
        value={reconfirmPasscode}
        password={true}
        label="Reconfirm your passcode"
        status={
          reconfirmPasscode.length > 0
            ? passcode === reconfirmPasscode
              ? FieldStatus.Success
              : FieldStatus.Error
            : undefined
        }
        placeholder="Re-enter passcode"
        autoComplete="new-password"
        onChangeValue={setReconfirmPasscode}
      />
    </StepCard>
  );
}
