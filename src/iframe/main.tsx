import IframeApp from '../components/IframeApp';
import render from '../components/render';
import { getAztecChainId, getChainId } from '../utils/config';
import { BBWasmProvider, WithBBWasm } from '../utils/wasmContext';
import { SignClientProvider } from '../walletConnect/signClientContext';
import IframeWallet from './IframeWallet';

render(
  <BBWasmProvider>
    <WithBBWasm>
      <SignClientProvider iframed={true}>
        <IframeApp>
          <IframeWallet chainId={getChainId()} aztecChainId={getAztecChainId()} />
        </IframeApp>
      </SignClientProvider>
    </WithBBWasm>
  </BBWasmProvider>,
);
