import IframeApp from '../components/IframeApp';
import render from '../components/render';
import { BBWasmProvider, WithBBWasm } from '../utils/wasmContext';
import { SignClientProvider } from '../walletConnect/signClientContext';
import IframeWallet from './IframeWallet';

render(
  <BBWasmProvider>
    <WithBBWasm>
      <SignClientProvider iframed={true}>
        <IframeApp>
          <IframeWallet />
        </IframeApp>
      </SignClientProvider>
    </WithBBWasm>
  </BBWasmProvider>,
);
