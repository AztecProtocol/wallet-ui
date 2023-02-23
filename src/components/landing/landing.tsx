import { Card, CardTheme, CardHeaderSize, Button, ButtonTheme, ButtonSize } from '@aztec/aztec-ui';
import style from './landing.module.scss';

interface LandingProps {
  onCreateWallet: () => void;
  onLogin: () => void;
}
export function Landing({ onCreateWallet, onLogin }: LandingProps) {
  return (
    <Card
      className={style.card}
      headerSize={CardHeaderSize.NONE}
      cardTheme={CardTheme.LIGHT}
      cardContent={
        <div className={style.cardContent}>
          <div className={style.header}>Welcome! Let's Get Started</div>
          <div className={style.buttons}>
            <Button
              theme={ButtonTheme.Primary}
              size={ButtonSize.Medium}
              text="Create Wallet"
              className={style.button}
              onClick={onCreateWallet}
            />
            <Button
              theme={ButtonTheme.Secondary}
              size={ButtonSize.Medium}
              text="Log In"
              className={style.button}
              onClick={onLogin}
            />
          </div>
        </div>
      }
    />
  );
}
