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
  const [warningAccepted, setWarningAccepted] = useState(false);

  return (
    <Card
      className={style.card}
      headerSize={CardHeaderSize.NONE}
      cardContent={
        <div className={style.cardContent}>
          <div className={style.header}>
            <div>Confirm your transaction</div>
          </div>
          <TransactionSummary requestData={props.request.data} sdk={props.sdk} />
          <p>
            This is experimental software that hasn't yet been externally audited. Your private key is stored in the
            browser, for security amounts are capped at 1 ETH. Use at your own risk.
          </p>
          <label>
            I understand the risks
            <input type="checkbox" checked={warningAccepted} onChange={() => setWarningAccepted(!warningAccepted)} />
          </label>
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
              disabled={!warningAccepted}
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
