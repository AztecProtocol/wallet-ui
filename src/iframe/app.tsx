import { EthereumProvider } from '@aztec/sdk';
import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { PrivKeyResolver } from '../keystore/UIKeyStore.js';
import { CreateAccountKey } from './views/create_account_key.js';
import { CreateSpendingKey } from './views/create_spending_key.js';
import { viewPaths } from './views/index.js';

interface AppProps {
  chainId: number;
  ethereumProvider: EthereumProvider;
}

export function App({ chainId, ethereumProvider }: AppProps) {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const reqId = searchParams.get('reqId')!;

  // privKeyResolve:
  //   Created in LegacyKeyStore to pass control to the UI.
  //   Resolved by the UI to return e.g. the generated spending key
  const [privKeyResolve, setPrivKeyResolve] = useState<PrivKeyResolver>(() => undefined);

  const startGenerateSpendingKey = (resolve: PrivKeyResolver) => {
    navigate(viewPaths.CREATE_SPENDING_KEY);
    setPrivKeyResolve(() => resolve);
  };
  const startGenerateAccountKey = (resolve: PrivKeyResolver) => {
    navigate(viewPaths.CREATE_ACCOUNT_KEY);
    setPrivKeyResolve(() => resolve);
  };

  // TODO wire general message signing through the iframe UI like the above start functions

  // useEffect(() => {
  //   keyStore.connectUI(startGenerateSpendingKey, startGenerateAccountKey);
  // }, []);

  return (
    <Routes>
      {/* <Route
        path={viewPaths.CREATE_ACCOUNT_KEY}
        element={
          <div>
            <CreateAccountKey
              ethereumProvider={ethereumProvider}
              reqId={reqId}
              privKeyResolve={privKeyResolve}
            />
          </div>
        }
      />
      <Route
        path={viewPaths.CREATE_SPENDING_KEY}
        element={
          <div>
            <CreateSpendingKey ethereumProvider={ethereumProvider} reqId={reqId} privKeyResolve={privKeyResolve} />
          </div>
        }
      />
      <Route path={viewPaths.NADA} element={<></>} /> */}
    </Routes>
  );
}
