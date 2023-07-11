import { Card, CardHeaderSize, Button, ButtonTheme, ButtonSize } from '@aztec/aztec-ui';
import style from './approve_transaction.module.scss';
import {} from '../../iframe/WalletConnectKeyStore';
import { AztecSdk } from '@aztec/alpha-sdk';
import { TransactionSummary } from './transaction_summary';
import { VerticalScrollRegion } from '@aztec/aztec-ui';
import { Buffer } from 'buffer/';

export interface ApproveTransactionProps {
  dappOrigin: string;
  request: any;
  onUserResponse: (accepted: boolean) => void;
}

export function ApproveTransaction(props: ApproveTransactionProps) {
  console.log(props.request.params[0]);
  return (
    <Card
      className={style.card}
      headerSize={CardHeaderSize.NONE}
      cardContent={
        <div className={style.cardContent}>
          <div className={style.title}>Confirm your transaction</div>
          <div className={style.small}>Payload: 0x{Buffer.from(props.request.params[0].data).toString('hex')}</div>
          <div className={style.buttons}>
            <Button
              theme={ButtonTheme.Secondary}
              className={style.confirmButton}
              text="Cancel"
              size={ButtonSize.Medium}
              onClick={() => {
                props.onUserResponse(false);
              }}
            />
            <Button
              theme={ButtonTheme.Primary}
              className={style.confirmButton}
              text="Confirm"
              size={ButtonSize.Medium}
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
