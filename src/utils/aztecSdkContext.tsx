import { AztecSdk, createAztecSdk, JsonRpcProvider } from '@aztec/alpha-sdk';
import { createContext, ReactNode, useEffect, useState } from 'react';
import { EthereumChainId, getEthereumHost } from './config';
import { chainIdToNetwork } from './networks';

async function getDeployTag() {
  // If we haven't overridden our deploy tag, we discover it at runtime. All s3 deployments have a file
  // called DEPLOY_TAG in their root containing the deploy tag.
  if (process.env.NODE_ENV === 'production') {
    return await fetch('/DEPLOY_TAG').then(resp => (resp.ok ? resp.text() : ''));
  } else {
    return '';
  }
}

async function getRollupProviderUrl() {
  if (process.env.ROLLUP_HOST) {
    return process.env.ROLLUP_HOST;
  } else {
    const deployTag = await getDeployTag();
    if (deployTag) {
      return `https://api.aztec.network/${deployTag}/falafel`;
    } else {
      return `${window.location.protocol}//${window.location.hostname}:8081`;
    }
  }
}

interface WalletConnectContextData {
  client?: any;
}

export const WalletConnectContext = createContext<WalletConnectContextData>({});

export function WalletConnectProvider({ children, noSync }: { children: ReactNode; noSync?: boolean }) {

  return <WalletConnectContext.Provider value={{client:}}>{children}</WalletConnectContext.Provider>;
}
