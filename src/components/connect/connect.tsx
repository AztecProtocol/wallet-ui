import { Card, CardHeaderSize, Button, ButtonTheme } from '@aztec/aztec-ui';
import { NextStepResult } from '../StepCard';
import logo from '../assets/zkmoney-logo.png';
import style from './connect.module.scss';
import { useContext } from 'react';
import { ToastsContext, addErrorToast } from '../../utils/toastsContext';

export function Connect(props: { onUserResponse: (accepted: boolean) => Promise<NextStepResult> }) {
  const setToasts = useContext(ToastsContext);

  return (
    <Card
      className={style.card}
      headerSize={CardHeaderSize.MEDIUM}
      cardHeader="Sign in to Aztec Wallet"
      cardContent={
        <div className={style.cardContent}>
          <div className={style.header}>
            <img className={style.logo} src={logo} alt="Logo" />
            <div>zk.money wants to connect to your Aztec Wallet</div>
          </div>
          <div className={style.permissions}>
            You are allowing the app to:
            <ul className={style.list}>
              <li>View your aztec address</li>
            </ul>
          </div>
          <div className={style.buttons}>
            <Button
              theme={ButtonTheme.Secondary}
              text="Deny"
              onClick={async () => {
                const error = (await props.onUserResponse(false))?.error;
                if (error) {
                  addErrorToast(error, setToasts);
                }
              }}
            />
            <Button
              theme={ButtonTheme.Primary}
              text="Allow"
              onClick={async () => {
                const error = (await props.onUserResponse(true))?.error;
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
