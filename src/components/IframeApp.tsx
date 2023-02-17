import { ReactNode } from 'react';
import { ToastsProvider } from '../utils/toastsContext';
import style from './iframeApp.module.scss';

interface IframeAppProps {
  children: ReactNode;
}

export default function IframeApp({ children }: IframeAppProps) {
  return (
    <div className={style.backdrop}>
      <ToastsProvider>{children}</ToastsProvider>
    </div>
  );
}
