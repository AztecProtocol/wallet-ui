import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, walletConnectWallet, braveWallet } from '@rainbow-me/rainbowkit/wallets';

import { configureChains, createClient, Chain } from 'wagmi';
import { mainnet, localhost } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { Brand } from './brand';

export type EthereumChainId = Brand<number, 'EthereumChainId'>;
export type AztecChainId = Brand<number, 'AztecChainId'>;

function getWagmiChain(chainId: EthereumChainId): Chain {
  switch (chainId) {
    case 1:
      return mainnet;
    case 1337:
    case 31337:
    case 0xe2e:
      return { ...localhost, id: chainId };
    case 0xa57ec:
    case 0x57a93:
    case 0xdef:
      return getForkProvider(chainId);
    default:
      throw new Error(`Unknown chainId: ${chainId}`);
  }
}

function getForkProvider(chainId: EthereumChainId): Chain {
  return {
    id: chainId,
    name: 'Aztec Ethereum Mainnet Fork',
    network: 'mainnet-fork',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: [getEthereumHost(chainId)] }, public: { http: [] } },
  };
}

function getPublicProvider(chainId: EthereumChainId) {
  try {
    return jsonRpcProvider({ rpc: () => ({ http: getEthereumHost(chainId) }) });
  } catch (e) {
    throw new Error('Could not determine publicProvider');
  }
}

export function getEthereumHost(chainId: EthereumChainId) {
  switch (chainId) {
    case 5:
      return 'https://goerli.infura.io/v3/85712ac4df0446b58612ace3ed566352';
    case 1337:
      return 'http://localhost:8545';
    case 0xe2e: {
      const apiKey = localStorage.getItem('ETH_HOST_API_KEY') ?? '';
      return `http://localhost:8545/${apiKey}`;
    }
    case 0xa57ec: {
      const apiKey = localStorage.getItem('ETH_HOST_API_KEY') ?? '';
      return `https://aztec-connect-testnet-eth-host.aztec.network:8545/${apiKey}`;
    }
    case 0x57a93: {
      const apiKey = localStorage.getItem('ETH_HOST_API_KEY') ?? '';
      return `https://aztec-connect-stage-eth-host.aztec.network:8545/${apiKey}`;
    }
    case 0xdef: {
      const apiKey = localStorage.getItem('ETH_HOST_API_KEY') ?? '';
      return `https://aztec-connect-dev-eth-host.aztec.network:8545/${apiKey}`;
    }
    default:
      return 'https://aztec-connect-prod-eth-host.aztec.network:8545';
  }
}

export function getWagmiRainbowConfig(config: EthereumChainId) {
  const { chains, provider, webSocketProvider } = configureChains([getWagmiChain(config)], [getPublicProvider(config)]);

  const wallets = [metaMaskWallet({ chains }), walletConnectWallet({ chains }), braveWallet({ chains })];
  const connectors = connectorsForWallets([{ groupName: 'Supported', wallets }]);
  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
    webSocketProvider,
  });
  return { wagmiClient, chains };
}

export type WagmiRainbowConfig = ReturnType<typeof getWagmiRainbowConfig>;

export function getAztecChainId() {
  return +(process.env.AZTEC_CHAIN_ID || '671337') as AztecChainId;
}

export function getChainId() {
  return +(process.env.ETHEREUM_CHAIN_ID || '1337') as EthereumChainId;
}
