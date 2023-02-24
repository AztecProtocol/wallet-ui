import { ReactNode } from 'react';
import { ToastsProvider } from '../utils/toastsContext';
import style from './app.module.scss';
import logo from './assets/wallet-logo.svg';
import brand from './assets/wallet-brand.svg';

interface AppCardProps {
  children: ReactNode;
}

export default function AppCard({ children }: AppCardProps) {
  return (
    <div className={style.background}>
      <div className={style.appHeader}>
        <img className={style.appLogo} src={logo} alt="Wallet logo" />
        <img className={style.appName} src={brand} alt="Wallet.Aztec" />
      </div>
      <div className={style.app}>
        <ToastsProvider>{children}</ToastsProvider>
      </div>
    </div>
  );
}
