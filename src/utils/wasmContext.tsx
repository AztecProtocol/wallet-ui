import { BarretenbergWasm } from '@aztec/sdk';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import getWasm from './getWasm';

export const BBWasmContext = createContext(null);

export function BBWasmProvider({ children }: { children: ReactNode }) {
  const [bbWasm, setBBWasm] = useState<BarretenbergWasm | null>(null);
  useEffect(() => {
    getWasm()
      .then(wasm => setBBWasm(wasm))
      .catch(console.error);
  }, []);

  return <BBWasmContext.Provider value={bbWasm}>{children}</BBWasmContext.Provider>;
}

export function WithBBWasm({ children }: { children: ReactNode }) {
  const wasm = useContext(BBWasmContext);
  return <>{!wasm ? <div>"Loading..."</div> : children}</>;
}
