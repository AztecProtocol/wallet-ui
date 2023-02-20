import { Card, CardHeaderSize, Button, ButtonTheme } from '@aztec/aztec-ui';
import style from './approve_keystore_request.module.scss';
import { KeyStoreRequest } from '../../iframe/WalletConnectKeyStore';

export interface ApproveKeyStoreRequestProps {
  dappOrigin: string;
  request: KeyStoreRequest;
  onUserResponse: (accepted: boolean) => void;
}

export function ApproveKeyStoreRequest(props: ApproveKeyStoreRequestProps) {
  let requestSummary = <div>Transaction summary</div>;
  return (
    <Card
      className={style.card}
      headerSize={CardHeaderSize.NONE}
      cardContent={
        <div className={style.cardContent}>
          <div className={style.header}>
            <div>Confirm your transaction</div>
          </div>
          {requestSummary}
          <div className={style.buttons}>
            <Button
              theme={ButtonTheme.Secondary}
              text="Cancel"
              onClick={() => {
                props.onUserResponse(false);
              }}
            />
            <Button
              theme={ButtonTheme.Primary}
              text="Confirm"
              onClick={() => {
                props.onUserResponse(true);
              }}
            />
          </div>
        </div>
      }
    />
  );
}
