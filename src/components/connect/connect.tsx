import { NextStepResult } from '../StepCard';
import style from './connect.module.scss';
import { ApprovalDialog } from '../approval_dialog';

export function Connect(props: {
  dappName: string;
  dappLogoUrl?: string;
  onUserResponse: (accepted: boolean) => Promise<NextStepResult>;
}) {
  return (
    <ApprovalDialog
      permissions={
        <ul className={style.list}>
          <li>View your aztec address</li>
        </ul>
      }
      title={`${props.dappName} wants to connect to your  Wallet`}
      dappLogoUrl={props.dappLogoUrl}
      onUserResponse={props.onUserResponse}
    />
  );
}
