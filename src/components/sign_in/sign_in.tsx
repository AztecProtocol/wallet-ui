import { Card, CardTheme, CardHeaderSize, Button, ButtonTheme, Field, Hyperlink, FieldStatus } from '@aztec/aztec-ui';
import { useContext, useState } from 'react';
import style from './sign_in.module.scss';
import { NextStepResult } from '../StepCard';
import { ToastsContext, addErrorToast } from '../../utils/toastsContext';

interface SignInProps {
  showCreate?: boolean;
  showForgot?: boolean;
  initialEncryptedKeystore: string | null;
  isValidPasscode: (passcode: string) => boolean;
  onCreateAccount: () => void;
  // Save expensive validation for onFinish
  onFinish: (encryptedKeystore: string, passcode: string) => Promise<NextStepResult>;
}
export function SignIn({
  showCreate,
  showForgot,
  initialEncryptedKeystore,
  isValidPasscode,
  onCreateAccount,
  onFinish,
}: SignInProps) {
  const setToasts = useContext(ToastsContext);
  const [encryptedKeystore, setEncryptedKeystore] = useState<string>(initialEncryptedKeystore || '');
  const [passcode, setPasscode] = useState('');

  return (
    <Card
      className={style.card}
      headerSize={CardHeaderSize.NONE}
      cardHeader="Sign in to Aztec Wallet"
      cardTheme={CardTheme.LIGHT}
      cardContent={
        <div className={style.cardContent}>
          <div className={style.header}>Access the Aztec Network</div>
          <div className={style.fields}>
            <Field
              value={encryptedKeystore}
              password={true}
              autoComplete="current-password"
              status={encryptedKeystore.length > 0 ? FieldStatus.Success : undefined}
              label="Encrypted keystore"
              placeholder="Enter encrypted keystore"
              onChangeValue={setEncryptedKeystore}
            />
            <Field
              value={passcode}
              password={true}
              autoComplete="current-password"
              status={passcode.length > 0 ? FieldStatus.Success : undefined}
              label="Passcode"
              placeholder="Enter passcode"
              onChangeValue={setPasscode}
            />
            <div className={style.links}>
              {showCreate && <Hyperlink className={style.link} label="Create new account" onClick={onCreateAccount} />}
              {showForgot && <Hyperlink className={style.link} label="I've forgotten my passcode" />}
            </div>
          </div>
          <div className={style.buttons}>
            <div />
            <Button
              theme={ButtonTheme.Primary}
              text="Next"
              disabled={!isValidPasscode(passcode)}
              onClick={async () => {
                const error = (await onFinish(encryptedKeystore, passcode))?.error;
                if (error) {
                  addErrorToast(error, setToasts);
                }
              }}
            />
          </div>
        </div>
      }
    />
  );
}
