import { Card, CardTheme, CardHeaderSize, Button, ButtonTheme, Field, Hyperlink, FieldStatus } from '@aztec/aztec-ui';
import logo from '../assets/zkmoney-logo.png';
import { useContext, useState } from 'react';
import style from './sign_in.module.scss';
import { NextStepResult } from '../StepCard';
import { ToastsContext } from '../AppCard';

interface SignInProps {
  isValidPasscode: (passcode: string) => boolean;
  onLoginWithDifferentAccount: () => void;
  // Save expensive validation for onFinish
  onFinish: (passcode: string) => Promise<NextStepResult>;
}
export function SignIn({ isValidPasscode, onLoginWithDifferentAccount, onFinish }: SignInProps) {
  const setToasts = useContext(ToastsContext);
  const [passcode, setPasscode] = useState('');
  return (
    <Card
      className={style.card}
      headerSize={CardHeaderSize.NONE}
      cardHeader="Sign in to Aztec Wallet"
      cardTheme={CardTheme.LIGHT}
      cardContent={
        <div className={style.cardContent}>
          <div className={style.header}>
            <img className={style.logo} src={logo} alt="Logo" />
            <div>Sign in to continue to zk.money</div>
          </div>
          <div className={style.fields}>
            <Field
              value={passcode}
              password={true}
              autoComplete="current-password"
              status={passcode.length > 0 ? FieldStatus.Success : undefined}
              label="Unlock with Passcode"
              placeholder="Enter passcode"
              onChangeValue={setPasscode}
            />
            <div className={style.links}>
              <Hyperlink
                className={style.link}
                label="Log in with a different account"
                onClick={onLoginWithDifferentAccount}
              />
              <Hyperlink className={style.link} label="I've forgotten my passcode" />
            </div>
          </div>
          <div className={style.buttons}>
            <div />
            <Button
              theme={ButtonTheme.Primary}
              text="Next"
              disabled={!isValidPasscode(passcode)}
              onClick={async () => {
                const error = (await onFinish(passcode))?.error;
                if (error) {
                  setToasts((prevToasts: any) => [
                    ...prevToasts,
                    {
                      text: error,
                      key: Date.now(),
                      autocloseInMs: 5e3,
                      closable: true,
                    },
                  ]);
                }
              }}
            />
          </div>
        </div>
      }
    />
  );
}
