import '@rainbow-me/rainbowkit/styles.css';
import { WagmiConfig } from 'wagmi';
import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';

import render from '../components/render';
import { BBWasmContext, BBWasmProvider } from '../utils/wasmContext';
import { getAztecChainId, getChainId, getWagmiRainbowConfig, WagmiRainbowConfig } from '../utils/config';
import { useContext, useEffect, useState } from 'react';
import { AztecSdkProvider } from '../utils/aztecSdkContext';
import AppCard from '../components/AppCard';
import CreateAccount from './create_account';
import OpenWallet from './openWallet';
import { getCachedEncryptedKeystore } from '../utils/sessionUtils';

function StandaloneApp() {
  const chainId = getChainId();
  const [wagmiConfig, setWagmiConfig] = useState<WagmiRainbowConfig>();
  const [encryptedKeys, setEncryptedKeys] = useState(getCachedEncryptedKeystore());

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
        <AppCard>
          {!encryptedKeys && (
            <CreateAccount
              chainId={chainId}
              onAccountCreated={newEncryptedKeys => setEncryptedKeys(newEncryptedKeys)}
            />
          )}
          {encryptedKeys && (
            <OpenWallet
              encryptedKeystore={encryptedKeys}
              aztecChainId={getAztecChainId()}
              onCreateAccount={() => setEncryptedKeys('')}
            />
          )}
        </AppCard>
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
