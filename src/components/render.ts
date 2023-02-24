import { isLogEnabled, enableLogs } from '@aztec/alpha-sdk';
import { ReactElement } from 'react';
import * as ReactDOM from 'react-dom/client';

export default function render(element: ReactElement) {
  if (!isLogEnabled('bb:') && process.env.NODE_ENV !== 'production') {
    enableLogs('bb:*');
    location.reload();
  }

  const root = ReactDOM.createRoot(document.getElementById('root')!);
  root.render(element);
}
