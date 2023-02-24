import {
  Card,
  CardTheme,
  CardHeaderSize,
  Button,
  ButtonTheme,
  Field,
  Hyperlink,
  FieldStatus,
  ButtonSize,
} from '@aztec/aztec-ui';
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
  // Save expensive validation for onFinish
  onFinish: (encryptedKeystore: string, passcode: string) => Promise<NextStepResult>;
}
export function SignIn({
  showEncryptedKeystore,
  showCreate,
  showForgot,
  isValidPasscode,
  onCreateAccount,
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
            {/* Ensure we trigger either the aztec key or passcode password manager context */}
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="username"
              value={showEncryptedKeystore ? 'Aztec Key' : 'Aztec Passcode'}
              readOnly
              style={{ position: 'fixed', top: '-50px', left: 0 }}
            />
            {showEncryptedKeystore && (
              <Field
                containerClassName={style.fieldContainer}
                className={style.field}
                value={encryptedKeystore}
                password={true}
                autoComplete="current-password"
                status={encryptedKeystore.length > 0 ? FieldStatus.Success : undefined}
                label="Unlock with Aztec Key & Passcode"
                placeholder="Enter Aztec Key"
                onChangeValue={setEncryptedKeystore}
              />
            )}

            {/* TODO firefox password manager likely needs hacks so that this is not a password=true
            right before submit
            TODO add lastpass (and others) ignore attributes if on page with aztec key */}
            <Field
              containerClassName={style.fieldContainer}
              className={style.field}
              value={passcode}
              password={true}
              autoComplete={showEncryptedKeystore ? 'off' : 'current-password'}
              status={passcode.length > 0 ? FieldStatus.Success : undefined}
              label={showEncryptedKeystore ? undefined : 'Unlock with Passcode'}
              placeholder="Enter passcode"
              onChangeValue={setPasscode}
            />
            <div className={style.links}>
              {showCreate && <Hyperlink className={style.link} label="Create new account" onClick={onCreateAccount} />}
              {showForgot && <Hyperlink className={style.link} label="I've forgotten my passcode" />}
            </div>
          </div>
          <div className={style.buttons}>
            <Button
              theme={ButtonTheme.Primary}
              size={ButtonSize.Medium}
              text="Unlock"
              className={style.unlockButton}
              disabled={!isValidPasscode(passcode)}
              onClick={async () => {
                const error = (await onFinish(encryptedKeystore, passcode))?.error;
                if (error) {
                  if (error.match(/provided data is too small/)) {
                    addErrorToast('The Aztec Key provided is too short.', setToasts);
                  } else if (error.match(/OperationError/)) {
                    addErrorToast('The passcode provided is incorrect for this key.', setToasts);
                  } else {
                    addErrorToast(error, setToasts);
                  }
                }
              }}
            />
          </div>
        </div>
      }
    />
  );
}
