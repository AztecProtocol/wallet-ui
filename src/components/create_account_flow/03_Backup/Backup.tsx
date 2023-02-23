import { ImageButton, ImageButtonIcon } from '@aztec/aztec-ui';
import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ConstantKeyPair, RECOVERY_KEY_MESSAGE } from '@aztec/sdk-incubator';
import { useAccount, useSignMessage } from 'wagmi';
import StepCard, { NextStepResult } from '../../StepCard';
import styles from './Backup.module.scss';

interface BackupProps {
  generateRecoveryKey: (signMessage: () => Promise<`0x${string}`>) => Promise<ConstantKeyPair>;
  doDownloadRecoveryKit: (recoveryKey: ConstantKeyPair) => Promise<void>;
  onBack?: () => void;
  onFinish: () => Promise<NextStepResult>;
}
export default function Backup({ generateRecoveryKey, doDownloadRecoveryKit, onBack, onFinish }: BackupProps) {
  const [kitDownloaded, setKitDownloaded] = useState(false);

  const signMessage = useSignMessage({
    message: RECOVERY_KEY_MESSAGE,
  });
  const account = useAccount();

  return (
    <StepCard
      header="Connect an Existing Wallet to generate a Recovery Kit"
      subtitle="This will be used to recover your funds to a new Wallet account should you forget your login details."
      nextButtonDisabled={!kitDownloaded}
      currentStep={3}
      steps={5}
      handlePreviousStep={onBack}
      handleNextStep={() => onFinish()}
    >
      <ConnectButton showBalance={false} accountStatus="address" />
      <div className={styles.buttonsWrapper}>
        <ImageButton
          icon={ImageButtonIcon.Download}
          checked={kitDownloaded}
          label="Download your recovery kit"
          disabled={!account.address}
          onClick={async () => {
            const recoveryKey = await generateRecoveryKey(signMessage.signMessageAsync);
            await doDownloadRecoveryKit(recoveryKey);
            setKitDownloaded(true);
          }}
        />
      </div>
    </StepCard>
  );
}
