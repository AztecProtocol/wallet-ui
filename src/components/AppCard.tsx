import { ToastGroup, ToastGroupPosition } from '@aztec/aztec-ui';
import { createContext, ReactNode, useState } from 'react';
import style from './app.module.scss';

export const ToastsContext = createContext<any>([]);

interface AppCardProps {
  children: ReactNode;
}

export function addErrorToast(error: string, setToasts: any) {
  setToasts((prevToasts: any) => [
    ...prevToasts,
    {
      text: error,
      key: Date.now(),
      autocloseInMs: 5e3,
      closable: true,
    },
  ]);
}

export default function AppCard({ children }: AppCardProps) {
  const [toasts, setToasts] = useState([]);

  function closeToast(key: string) {
    setToasts(prevToasts => prevToasts.filter((toast: any) => toast.key !== key));
  }

  return (
    <div className={style.app}>
      <ToastsContext.Provider value={setToasts}>
        {children}
        <ToastGroup toasts={toasts} position={ToastGroupPosition.BottomCenter} onCloseToast={closeToast} />
      </ToastsContext.Provider>
    </div>
  );
}
