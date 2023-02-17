import { Route, Routes } from 'react-router';
import { ToastGroup, ToastGroupPosition } from '@aztec/aztec-ui';
import { createContext, useState } from 'react';
import { SignIn } from './sign_in';
import { CreateAccount } from './create_account';
import { Connect } from './connect';
import style from './app.module.scss';

export const ToastsContext = createContext<any>([]);

interface WalletAppProps {
  state: 'login' | 'create' | 'connect';
}

export function WalletApp(props: WalletAppProps) {
  const [toasts, setToasts] = useState([]);

  function closeToast(key: string) {
    setToasts(prevToasts => prevToasts.filter((toast: any) => toast.key !== key));
  }

  return (
    <div className={style.app}>
      <ToastsContext.Provider value={setToasts}>
        {props.state === 'login' && <SignIn />}
        {props.state === 'create' && <CreateAccount step="PasscodeAlias" />}
        {props.state === 'connect' && <Connect />}
        <ToastGroup toasts={toasts} position={ToastGroupPosition.BottomCenter} onCloseToast={closeToast} />
      </ToastsContext.Provider>
    </div>
  );
}
