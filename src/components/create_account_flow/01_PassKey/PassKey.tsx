import { Field, FieldStatus } from '@aztec/aztec-ui';
import { useState } from 'react';
import StepCard, { NextStepResult } from '../../StepCard';

interface PassKeyProps {
  mounted: boolean;
  // Note: leave heavier validation for onFinish
  onBack?: () => void;
  onFinish: (passcode: string, userAlias: string) => Promise<NextStepResult>;
}

export default function Passkey({ mounted, onBack, onFinish }: PassKeyProps) {
  if (!mounted) {
    return null;
  }
  return (
    <StepCard
      header="Register Passkey"
      subtitle=""
      currentStep={1}
      steps={2}
      nextButtonDisabled={false}
      handlePreviousStep={onBack}
      handleNextStep={() => {
        onFinish();
      }}
    >
      <p>Clicking next will register a passkey</p>
    </StepCard>
  );
}
