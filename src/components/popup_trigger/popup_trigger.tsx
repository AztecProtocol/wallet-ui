import { Card, CardHeaderSize, Button, ButtonTheme } from '@aztec/aztec-ui';
import style from './popup_trigger.module.scss';

export function PopupTrigger(props: { dappOrigin: string; onClick: () => void }) {
  return (
    <div className={style.backdrop}>
      <Card
        className={style.card}
        headerSize={CardHeaderSize.NONE}
        cardContent={
          <div className={style.cardContent}>
            <div className={style.header}>
              <div>Allow {props.dappOrigin} to view your assets & Wallet balance</div>
            </div>
            <div className={style.subtitle}>You will need to confirm this in the Wallet app.</div>
            <Button theme={ButtonTheme.Primary} text="Confirm in App" onClick={props.onClick} />
          </div>
        }
      />
    </div>
  );
}
