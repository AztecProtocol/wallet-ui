import { createContext, ReactNode, useEffect, useState } from 'react';
import { createSignClient } from './createSignClient';

interface SignClientContextData {
  client?: any;
  initError?: Error;
}

export const SignClientContext = createContext<SignClientContextData>({});

export function SignClientProvider({ children, iframed }: { children: ReactNode; iframed: boolean }) {
  const [client, setClient] = useState<any | undefined>(undefined);
  const [initError, setInitError] = useState<Error | undefined>(undefined);

  async function init() {
    try {
      setClient(await createSignClient(false));
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
