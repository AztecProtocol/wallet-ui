// @ts-ignore
import { ImageButton, ImageButtonIcon } from '@aztec/aztec-ui';
import { useState } from 'react';
import StepCard, { NextStepResult } from '../../StepCard';
import styles from './Backup.module.scss';

interface BackupProps {
  doDownloadRecoveryKit: () => Promise<void>;
  doDownloadKey: () => Promise<NextStepResult>;
  onBack?: () => void;
  onFinish: () => Promise<NextStepResult>;
}
export default function Backup({ doDownloadRecoveryKit, doDownloadKey, onBack, onFinish }: BackupProps) {
  const [kitDownloaded, setKitDownloaded] = useState(false);
  const [keyDownloaded, setKeyDownloaded] = useState(false);
  return (
    <StepCard
      header={'Back Up Your Credentials'}
      nextButtonDisabled={!kitDownloaded || !keyDownloaded}
      handlePreviousStep={onBack}
      handleNextStep={() => onFinish()}
    >
      <div className={styles.buttonsWrapper}>
        <ImageButton
          icon={ImageButtonIcon.Download}
          label="Download your recovery kit"
          onClick={async () => {
            await doDownloadRecoveryKit();
            setKitDownloaded(true);
          }}
        />
        <ImageButton
          icon={ImageButtonIcon.Download}
          label="Download your key"
          onClick={async () => {
            await doDownloadKey();
            setKeyDownloaded(true);
          }}
        />
      </div>
    </StepCard>
  );
}
