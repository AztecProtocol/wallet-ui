import { ImageButton, ImageButtonIcon } from '@aztec/aztec-ui';
import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ConstantKeyPair, RECOVERY_KEY_MESSAGE } from '@aztec/sdk';
import { useAccount, useSignMessage } from 'wagmi';
import StepCard, { NextStepResult } from '../../StepCard';
import styles from './Backup.module.scss';

interface BackupProps {
  generateRecoveryKey: (signMessage: () => Promise<`0x${string}`>) => Promise<ConstantKeyPair>;
  doDownloadRecoveryKit: (recoveryKey: ConstantKeyPair) => Promise<void>;
  doDownloadKey: () => Promise<NextStepResult>;
  onBack?: () => void;
  onFinish: () => Promise<NextStepResult>;
}
export default function Backup({
  generateRecoveryKey,
  doDownloadRecoveryKit,
  doDownloadKey,
  onBack,
  onFinish,
}: BackupProps) {
  const [kitDownloaded, setKitDownloaded] = useState(false);
  const [keyDownloaded, setKeyDownloaded] = useState(false);

  const signMessage = useSignMessage({
    message: RECOVERY_KEY_MESSAGE,
  });
  const account = useAccount();

  return (
    <StepCard
      header={'Back Up Your Credentials'}
      nextButtonDisabled={!kitDownloaded || !keyDownloaded}
      handlePreviousStep={onBack}
      handleNextStep={() => onFinish()}
    >
      <ConnectButton showBalance={false} accountStatus="address" />
      <div className={styles.buttonsWrapper}>
        <ImageButton
          icon={ImageButtonIcon.Download}
          label="Download your recovery kit"
          disabled={!account.address}
          onClick={async () => {
            const recoveryKey = await generateRecoveryKey(signMessage.signMessageAsync);
            await doDownloadRecoveryKit(recoveryKey);
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
