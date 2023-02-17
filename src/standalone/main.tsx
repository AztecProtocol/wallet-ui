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
import { getCachedEncryptedKeystore, setCachedEncryptedKeystore } from '../utils/sessionUtils';
import { useWalletConnectServer, WalletConnectProposal } from './useWalletConnectServer';

function StandaloneApp() {
  const chainId = getChainId();
  const [wagmiConfig, setWagmiConfig] = useState<WagmiRainbowConfig>();
  const [proposal, setProposal] = useState<WalletConnectProposal | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const {
    client,
    initError: wcInitError,
    init: wcInit,
  } = useWalletConnectServer({
    onSessionProposal: proposal => {
      setProposal(proposal);
    },
  });

  async function init() {
    setWagmiConfig(getWagmiRainbowConfig(chainId));
    await wcInit();
  }

  useEffect(() => {
    init();
  }, []);

  const wasm = useContext(BBWasmContext);

  if (!wasm || !wagmiConfig || !client) {
    return <div>Loading... {wcInitError ? wcInitError.message : ''}</div>;
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
          {proposal && isCreatingAccount && (
            <CreateAccount
              chainId={chainId}
              onAccountCreated={newEncryptedKeys => {
                setCachedEncryptedKeystore(newEncryptedKeys);
                setIsCreatingAccount(false);
              }}
            />
          )}
          {proposal && !isCreatingAccount && (
            <OpenWallet
              aztecChainId={getAztecChainId()}
              proposal={proposal}
              client={client}
              onCreateAccount={() => setIsCreatingAccount(true)}
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
