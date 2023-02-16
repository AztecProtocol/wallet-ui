import '@rainbow-me/rainbowkit/styles.css';
import { WagmiConfig } from 'wagmi';
import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';

import render from '../components/render';
import getChainId from '../utils/getChainId';
import { BBWasmContext, BBWasmProvider, WithBBWasm } from '../utils/wasmContext';
import StandaloneWallet from './StandaloneWallet';
import { getWagmiRainbowConfig, WagmiRainbowConfig } from '../utils/config';
import { useContext, useEffect, useState } from 'react';
import { App } from '../components/app';

function StandaloneApp() {
  const chainId = getChainId();
  const [wagmiConfig, setWagmiConfig] = useState<WagmiRainbowConfig | undefined>(undefined);

  async function init() {
    setWagmiConfig(getWagmiRainbowConfig(chainId));
  }

  useEffect(() => {
    (async () => {
      await init();
    })();
  }, []);

  const wasm = useContext(BBWasmContext);

  if (!wasm || !wagmiConfig) {
    return <div>Loading...</div>;
  }

  return (
    <WagmiConfig client={wagmiConfig.wagmiClient}>
      <RainbowKitProvider
        chains={wagmiConfig.chains}
        theme={lightTheme({
          accentColor: 'white',
          accentColorForeground: 'black',
          borderRadius: 'medium',
          fontStack: 'system',
          overlayBlur: 'none',
        })}
      >
        {/* <StandaloneWallet chainId={chainId} /> */}
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

render(
  <BBWasmProvider>
    <StandaloneApp />
  </BBWasmProvider>,
);
