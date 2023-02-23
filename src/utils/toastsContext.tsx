import { createContext, Dispatch, ReactNode, SetStateAction, useState } from 'react';
import { ToastContent, ToastGroup, ToastGroupPosition } from '@aztec/aztec-ui';

export const ToastsContext = createContext<Dispatch<SetStateAction<ToastContent[]>>>(() => {});

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

export function ToastsProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastContent[]>([]);

  function closeToast(key: string) {
    setToasts(prevToasts => prevToasts.filter((toast: any) => toast.key !== key));
  }

  return (
    <ToastsContext.Provider value={setToasts}>
      {children}
      <ToastGroup toasts={toasts} position={ToastGroupPosition.BottomCenter} onCloseToast={closeToast} />
    </ToastsContext.Provider>
  );
}
