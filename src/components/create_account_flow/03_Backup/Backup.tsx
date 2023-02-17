// @ts-ignore
import { ImageButton, ImageButtonIcon } from '@aztec/aztec-ui';
import { useState } from 'react';
import StepCard, { NextStepResult } from '../../StepCard';
import styles from './Backup.module.scss';

interface BackupProps {
  doDownloadKey: () => Promise<NextStepResult>;
  onBack?: () => void;
  onFinish: () => Promise<NextStepResult>;
}
export default function Backup({ doDownloadKey, onBack, onFinish }: BackupProps) {
  const [wasDownloaded, setWasDownloaded] = useState(false);
  return (
    <StepCard
      header={'Back Up Your Credentials'}
      nextButtonDisabled={!wasDownloaded}
      handlePreviousStep={onBack}
      handleNextStep={() => onFinish()}
    >
      <div className={styles.buttonsWrapper}>
        <ImageButton
          icon={ImageButtonIcon.Download}
          label="Download your key"
          onClick={async () => {
            await doDownloadKey();
            setWasDownloaded(true);
          }}
        />
      </div>
    </StepCard>
  );
}
