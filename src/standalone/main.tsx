import '@rainbow-me/rainbowkit/styles.css';
import { WagmiConfig } from 'wagmi';
import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';

import render from '../components/render';
import { BBWasmContext, BBWasmProvider } from '../utils/wasmContext';
import StandaloneWallet from './StandaloneWallet';
import { getAztecChainId, getChainId, getWagmiRainbowConfig, WagmiRainbowConfig } from '../utils/config';
import { useContext, useEffect, useState } from 'react';
import { AztecSdkProvider } from '../utils/aztecSdkContext';
import { WalletApp } from '../components/WalletApp';
import { BrowserRouter } from 'react-router-dom';

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
        <BrowserRouter>
          <WalletApp state="create" />
        </BrowserRouter>
        <StandaloneWallet chainId={chainId} aztecChainId={getAztecChainId()} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

render(
  <AztecSdkProvider chainId={getChainId()}>
    <BBWasmProvider>
      <StandaloneApp />
    </BBWasmProvider>
  </AztecSdkProvider>,
);
