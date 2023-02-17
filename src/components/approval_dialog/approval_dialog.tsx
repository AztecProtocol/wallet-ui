import { Card, CardHeaderSize, Button, ButtonTheme } from '@aztec/aztec-ui';
import { NextStepResult } from '../StepCard';
import logo from '../assets/zkmoney-logo.png';
import style from './approval_dialog.module.scss';
import { useContext } from 'react';
import { ToastsContext, addErrorToast } from '../../utils/toastsContext';

export function ApprovalDialog(props: {
  permissions: React.ReactNode;
  cardHeader: React.ReactNode;
  dappLogoUrl?: string;
  title: string;
  onUserResponse: (accepted: boolean) => Promise<NextStepResult>;
}) {
  const setToasts = useContext(ToastsContext);

  return (
    <Card
      className={style.card}
      headerSize={CardHeaderSize.MEDIUM}
      cardHeader={props.cardHeader}
      cardContent={
        <div className={style.cardContent}>
          <div className={style.header}>
            <img className={style.logo} src={props.dappLogoUrl || logo} alt="Logo" />
            <div>{props.title}</div>
          </div>
          <div className={style.permissions}>
            You are allowing the app to:
            {props.permissions}
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
