import '../components/index.scss';
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiConfig } from 'wagmi';
import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { AztecKeyStore } from '@aztec/alpha-sdk';

import render from '../components/render';
import { BBWasmContext, BBWasmProvider } from '../utils/wasmContext';
import { getChainId, getWagmiRainbowConfig, WagmiRainbowConfig } from '../utils/config';
import { useContext, useEffect, useState } from 'react';
import { AztecSdkProvider } from '../utils/aztecSdkContext';
import AppCard from '../components/AppCard';
import CreateAccount from './create_account';
import OpenWallet from './openWallet';
import { getCachedCredential } from '../utils/sessionUtils';
import { SignClientContext, SignClientProvider } from '../walletConnect/signClientContext';
import LoggedIn from './logged_in';
import { Landing } from '../components/landing';

enum Pages {
  LandingPage,
  CreateAccount,
  LoggedIn,
}

function StandaloneApp() {
  const [creds, setCreds] = useState(getCachedCredential());
  const [currentPage, setCurrentPage] = useState<Pages>(creds ? Pages.LoggedIn : Pages.LandingPage);

  const wasm = useContext(BBWasmContext);
  const { client } = useContext(SignClientContext);
  function renderView() {
    switch (currentPage) {
      case Pages.LandingPage:
        return (
          <Landing
            onCreateWallet={() => setCurrentPage(Pages.CreateAccount)}
            onLogin={() => setCurrentPage(Pages.Login)}
          />
        );
      case Pages.CreateAccount:
        return (
          <CreateAccount
            onAccountCreated={newEncryptedKeys => {
              setCreds(getCachedCredential());
              setCurrentPage(Pages.LoggedIn);
            }}
            onCancel={() => setCurrentPage(Pages.CreateAccount)}
          />
        );
      case Pages.LoggedIn:
        return <LoggedIn creds={getCachedCredential()} client={client} />;
    }
  }
  if (client) {
    return <AppCard>{renderView()}</AppCard>;
  }
}

render(
  <SignClientProvider iframed={false}>
    <StandaloneApp />
  </SignClientProvider>,
);
