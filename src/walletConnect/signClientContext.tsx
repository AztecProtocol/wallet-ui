import { SignClient } from '@walletconnect/sign-client/dist/types/client';
import { createContext, ReactNode, useEffect, useState } from 'react';
import { createSignClient } from './createSignClient';

interface SignClientContextData {
  client?: SignClient;
  initError?: Error;
}

export const SignClientContext = createContext<SignClientContextData>({});

export function SignClientProvider({ children, iframed }: { children: ReactNode; iframed: boolean }) {
  const [client, setClient] = useState<SignClient | undefined>(undefined);
  const [initError, setInitError] = useState<Error | undefined>(undefined);

  async function init() {
    try {
      setClient(await createSignClient(iframed));
    } catch (err) {
      setInitError(err as Error);
    }
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <SignClientContext.Provider
      value={{
        client,
        initError,
      }}
    >
      {children}
    </SignClientContext.Provider>
  );
}
