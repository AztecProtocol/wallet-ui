import { Card, CardTheme, CardHeaderSize, Button, ButtonTheme, Field, Hyperlink, FieldStatus } from '@aztec/aztec-ui';
import { useContext, useState } from 'react';
import style from './sign_in.module.scss';
import { NextStepResult } from '../StepCard';
import { ToastsContext, addErrorToast } from '../../utils/toastsContext';

interface SignInProps {
  showEncryptedKeystore: boolean;
  showCreate?: boolean;
  showForgot?: boolean;
  isValidPasscode: (passcode: string) => boolean;
  onCreateAccount: () => void;
  onChangeAccount: () => void;
  // Save expensive validation for onFinish
  onFinish: (encryptedKeystore: string, passcode: string) => Promise<NextStepResult>;
}
export function SignIn({
  showEncryptedKeystore,
  showCreate,
  showForgot,
  isValidPasscode,
  onCreateAccount,
  onChangeAccount,
  onFinish,
}: SignInProps) {
  const setToasts = useContext(ToastsContext);
  const [encryptedKeystore, setEncryptedKeystore] = useState<string>('');
  const [passcode, setPasscode] = useState('');

  return (
    <Card
      className={style.card}
      headerSize={CardHeaderSize.NONE}
      cardTheme={CardTheme.LIGHT}
      cardContent={
        <div className={style.cardContent}>
          <div className={style.header}>Access the Aztec Network</div>
          <div className={style.fields}>
            {showEncryptedKeystore && (
              <Field
                value={encryptedKeystore}
                password={true}
                autoComplete="current-password"
                status={encryptedKeystore.length > 0 ? FieldStatus.Success : undefined}
                label="Unlock with Aztec key"
                placeholder="Enter Aztec key"
                onChangeValue={setEncryptedKeystore}
              />
            )}
            <Field
              value={passcode}
              password={true}
              autoComplete="current-password"
              status={passcode.length > 0 ? FieldStatus.Success : undefined}
              label="Unlock with passcode"
              placeholder="Enter passcode"
              onChangeValue={setPasscode}
            />
            <div className={style.links}>
              {showCreate && <Hyperlink className={style.link} label="Create new account" onClick={onCreateAccount} />}
              {!showEncryptedKeystore && (
                <Hyperlink className={style.link} label="Access with a different account" onClick={onChangeAccount} />
              )}
              {showForgot && <Hyperlink className={style.link} label="I've forgotten my passcode" />}
            </div>
          </div>
          <div className={style.buttons}>
            <Button
              theme={ButtonTheme.Primary}
              text="Unlock"
              className={style.unlockButton}
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
