import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import { App } from './app.js';
import { createFundedWalletProvider } from './popup.test.js';

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

function getChainIdRpcHostMap(chainId: number): { [chainId: number]: string } {
  if (process.env.ETHEREUM_HOST) {
    return { [chainId]: process.env.ETHEREUM_HOST };
  } else {
    return {
      1: 'https://mainnet.infura.io/v3/6a04b7c89c5b421faefde663f787aa35',
      5: 'https://goerli.infura.io/v3/6a04b7c89c5b421faefde663f787aa35',
      1337: 'http://localhost:8545',
      0xa57ec: 'https://aztec-connect-testnet-eth-host.aztec.network:8545',
      0xdef: 'https://aztec-connect-dev-eth-host.aztec.network:8545',
    };
  }
}

const GlobalStyle = createGlobalStyle`
  html {
    margin: 0;
    overflow: hidden;
  }
  body {
    margin: 0;
    overflow: hidden;
  }
  #root {
    height: 100vh;
    overflow: hidden;
  }
`;

async function main() {
  try {
    const walletProvider = await createFundedWalletProvider();
    const address = walletProvider.getAccounts()[0];
    console.error('main');
    const root = createRoot(document.getElementById('root')!);
    root.render(
      <BrowserRouter>
        <GlobalStyle />
        <App ethereumProvider={walletProvider} address={address} />
      </BrowserRouter>,
    );
  } catch (err) {
    console.log(err);
  }
}

main().catch(() => {});
