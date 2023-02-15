import { useState } from 'react';
import { AppProps } from '../components/appProps.js';
import Onboarding from './onboarding/index.js';
import OpenWallet from './openWallet.js';

export default function StandaloneWallet(props: AppProps) {
  const [isOnboarding, setOnboarding] = useState<boolean>(false);

  return isOnboarding ? (
    <Onboarding {...props} onAccountCreated={() => setOnboarding(false)} />
  ) : (
    <OpenWallet {...props} onCreateAccount={() => setOnboarding(true)} />
  );
}
