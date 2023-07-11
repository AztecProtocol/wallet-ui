import { Field } from '@aztec/aztec-ui';
import { useContext } from 'react';
import StepCard, { NextStepResult } from '../../StepCard';
import { ToastsContext } from '../../../utils/toastsContext';

interface RegisteredKeyProps {
  onBack?: () => void;
  onFinish: () => Promise<NextStepResult>;
}

export default function RegisteredKey({ onBack, onFinish }: RegisteredKeyProps) {
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
      header="Passkey created successfully"
      subtitle="Make a note of this"
      currentStep={2}
      steps={2}
      handlePreviousStep={onBack}
      handleNextStep={async () => {
        return onFinish();
      }}
    ></StepCard>
  );
}
