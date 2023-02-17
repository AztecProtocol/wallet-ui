// @ts-ignore
import { Card, CardHeaderSize, Button, ButtonTheme } from '@aztec/aztec-ui';
import logo from '../assets/zkmoney-logo.png';
import style from './connect.module.scss';

export function Connect() {
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
              <li>Read your account balance</li>
            </ul>
          </div>
          <div className={style.buttons}>
            <Button
              theme={ButtonTheme.Secondary}
              text="Deny"
              onClick={() => {
                window.location.assign('http://zk.money/balance');
              }}
            />
            <Button
              theme={ButtonTheme.Primary}
              text="Allow"
              onClick={() => {
                window.location.assign('http://zk.money/balance');
              }}
            />
          </div>
        </div>
      }
    />
  );
}
