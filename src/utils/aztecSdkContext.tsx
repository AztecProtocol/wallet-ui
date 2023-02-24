import { AztecSdk, createAztecSdk, JsonRpcProvider } from '@aztec/sdk-incubator';
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

export async function createSdk(chainId: EthereumChainId) {
  const aztecJsonRpcProvider = new JsonRpcProvider(getEthereumHost(chainId));
  return createAztecSdk(aztecJsonRpcProvider, {
    serverUrl: await getRollupProviderUrl(),
    minConfirmation: chainIdToNetwork(chainId)?.isFrequent ? 1 : undefined,
  });
}

interface AztecSdkContextData {
  sdk?: AztecSdk;
  sdkError?: string;
}

export const AztecSdkContext = createContext<AztecSdkContextData>({});

export function AztecSdkProvider({
  children,
  chainId,
  noSync,
}: {
  children: ReactNode;
  chainId: EthereumChainId;
  noSync?: boolean;
}) {
  const [sdk, setSdk] = useState<AztecSdk | undefined>();
  const [sdkError, setSdkError] = useState('');

  useEffect(() => {
    setSdk(undefined);
    (async () => {
      try {
        setSdk(await createSdk(chainId));
      } catch (err: any) {
        console.error(err);
        setSdkError(err.toString());
      }
    })();
  }, [chainId]);

  useEffect(() => {
    if (sdk && !noSync) {
      (async () => {
        try {
          await sdk.run();
        } catch (err: any) {
          setSdkError(err.toString());
        }
      })();
    }
  }, [sdk]);

  return <AztecSdkContext.Provider value={{ sdk, sdkError }}>{children}</AztecSdkContext.Provider>;
}
