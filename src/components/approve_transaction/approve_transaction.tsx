import { Card, CardHeaderSize, Button, ButtonTheme } from '@aztec/aztec-ui';
import style from './approve_transaction.module.scss';
import { TransactionRequest } from '../../iframe/WalletConnectKeyStore';
import { useState } from 'react';
import { AztecSdk } from '@aztec/sdk';
import { TransactionSummary } from './transaction_summary';

export interface ApproveTransactionProps {
  dappOrigin: string;
  request: TransactionRequest;
  sdk: AztecSdk;
  onUserResponse: (accepted: boolean) => void;
}

export function ApproveTransaction(props: ApproveTransactionProps) {
  return (
    <Card
      className={style.card}
      headerSize={CardHeaderSize.NONE}
      cardContent={
        <div className={style.cardContent}>
          <div className={style.title}>Confirm your transaction</div>
          <TransactionSummary requestData={props.request.data} sdk={props.sdk} />
          <div className={style.buttons}>
            <Button
              theme={ButtonTheme.Secondary}
              className={style.confirmButton}
              text="Cancel"
              onClick={() => {
                props.onUserResponse(false);
              }}
            />
            <Button
              theme={ButtonTheme.Primary}
              className={style.confirmButton}
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
