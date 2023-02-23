import '../components/index.scss';
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiConfig } from 'wagmi';
import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { AztecKeyStore } from '@aztec/sdk-incubator';

import render from '../components/render';
import { BBWasmContext, BBWasmProvider } from '../utils/wasmContext';
import { getChainId, getWagmiRainbowConfig, WagmiRainbowConfig } from '../utils/config';
import { useContext, useEffect, useState } from 'react';
import { AztecSdkProvider } from '../utils/aztecSdkContext';
import AppCard from '../components/AppCard';
import CreateAccount from './create_account';
import OpenWallet from './openWallet';
import { getCachedEncryptedKeystore, setCachedEncryptedKeystore } from '../utils/sessionUtils';
import { SignClientProvider } from '../walletConnect/signClientContext';
import LoggedIn from './logged_in';
import { Landing } from '../components/landing';

enum Pages {
  LandingPage,
  CreateAccount,
  Login,
  LoggedIn,
}

function StandaloneApp() {
  const chainId = getChainId();
  const [wagmiConfig, setWagmiConfig] = useState<WagmiRainbowConfig>();
  const [currentPage, setCurrentPage] = useState<Pages>(getCachedEncryptedKeystore() ? Pages.Login : Pages.LandingPage);
  const [keyStore, setKeyStore] = useState<AztecKeyStore | null>(null);

  useEffect(() => {
    setWagmiConfig(getWagmiRainbowConfig(chainId));
  }, []);

  const wasm = useContext(BBWasmContext);

  if (!wagmiConfig || !wasm) {
    return null;
  }

  function renderView() {
    switch (currentPage) {
      case Pages.LandingPage:
        return (
          <Landing
            onCreateWallet={() => setCurrentPage(Pages.CreateAccount)}
            onLogin={() => setCurrentPage(Pages.Login)}
          />
        );
      case Pages.Login:
        return (
          <OpenWallet
            onKeyStoreOpened={(keyStore, encryptedKeystore) => {
              setKeyStore(keyStore);
              setCachedEncryptedKeystore(encryptedKeystore);
              setCurrentPage(Pages.LoggedIn);
            }}
            onCreateAccount={() => setCurrentPage(Pages.CreateAccount)}
          />
        );
      case Pages.CreateAccount:
        return (
          <CreateAccount
            chainId={chainId}
            onAccountCreated={newEncryptedKeys => {
              setCachedEncryptedKeystore(newEncryptedKeys);
              setCurrentPage(Pages.Login);
            }}
            onCancel={() => setCurrentPage(Pages.Login)}
          />
        );
      case Pages.LoggedIn:
        return <LoggedIn keyStore={keyStore!} />;
    }
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
        <AppCard>{renderView()}</AppCard>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

render(
  <AztecSdkProvider chainId={getChainId()}>
    <BBWasmProvider>
      <SignClientProvider iframed={false}>
        <StandaloneApp />
      </SignClientProvider>
    </BBWasmProvider>
  </AztecSdkProvider>,
);
