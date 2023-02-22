import { ReactNode } from 'react';
import { ToastsProvider } from '../utils/toastsContext';
import style from './app.module.scss';
import logo from './assets/wallet-logo.svg';

interface AppCardProps {
  children: ReactNode;
}

export default function AppCard({ children }: AppCardProps) {
  return (
    <div>
      <div className={style.appHeader}>
        <img className={style.appLogo} src={logo} alt="Wallet logo" />
        <div className={style.appName}>Wallet.Aztec</div>
      </div>
      <div className={style.app}>
        <ToastsProvider>{children}</ToastsProvider>
      </div>
    </div>
  );
}
