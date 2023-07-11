import { Core } from '@walletconnect/core';
import { Web3Wallet } from "@walletconnect/web3wallet";
import { CoreTypes } from '@walletconnect/types';
import { PrefixedStorage } from './prefixedStorage';
import { SignClient } from '@walletconnect/sign-client';

// Node16 module resolution seems to be broken for this package.

export async function createSignClient(isIframe: boolean) {
  const coreParams: CoreTypes.Options = {
    logger: 'debug',
    projectId: "46b15d4ac7df71221bbf8b7299b90b88",
    storage: new PrefixedStorage(document.referrer),
  }

  const core = new Core(coreParams);

  const web3wallet = await SignClient.init({
    core: core,
    metadata: {
      name: "Example WalletConnect Wallet",
      description: "Example WalletConnect Integration",
      url: "myexamplewallet.com",
      icons: [],
    },
  });
  window.client = web3wallet;
  return web3wallet;
}
