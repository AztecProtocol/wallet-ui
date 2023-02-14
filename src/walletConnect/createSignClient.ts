import { Core } from '@walletconnect/core';
import Client from '@walletconnect/sign-client';
import { SignClient } from '@walletconnect/sign-client/dist/types/client.js';
import { CoreTypes } from '@walletconnect/types';
import { PrefixedStorage } from './prefixedStorage.js';

// Node16 module resolution seems to be broken for this package.
const SignClientClass = Client as unknown as typeof SignClient;

export function createSignClient(isIframe: boolean) {
  const coreParams: CoreTypes.Options = {
    logger: 'debug',
    projectId: process.env.WALLETCONNECT_PROJECT_ID,
  };

  if (isIframe) {
    coreParams.storage = new PrefixedStorage(document.referrer);
  }

  const core = new Core(coreParams);

  const metadata = {
    name: 'Wallet name',
    description: 'A short description for your wallet',
    url: window.location.origin + window.location.pathname,
    icons: ['https://walletconnect.com/walletconnect-logo.png'],
    iframable: true,
  };

  return SignClientClass.init({
    logger: 'debug',
    core,
    // optional parameters
    relayUrl: 'wss://relay.walletconnect.com',
    metadata,
  });
}
