import { useState } from 'react';
import { AppProps } from '../components/appProps.js';
import CreateAccount from './create_account/index.js';
import OpenWallet from './openWallet.js';

export default function StandaloneWallet(props: AppProps) {
  const [isOnboarding, setOnboarding] = useState<boolean>(false);

  return isOnboarding ? (
    <CreateAccount {...props} onAccountCreated={() => setOnboarding(false)} />
  ) : (
    <OpenWallet {...props} onCreateAccount={() => setOnboarding(true)} />
  );
}
