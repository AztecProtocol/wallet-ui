import '../components/index.scss';
import IframeApp from '../components/IframeApp';
import render from '../components/render';
import { BBWasmProvider, WithBBWasm } from '../utils/wasmContext';
import { SignClientProvider } from '../walletConnect/signClientContext';
import IframeWallet from './IframeWallet';
import { getChainId } from '../utils/config';
import { AztecSdkProvider } from '../utils/aztecSdkContext';

render(
  <AztecSdkProvider chainId={getChainId()} noSync={true}>
    <BBWasmProvider>
      <WithBBWasm>
        <SignClientProvider iframed={true}>
          <IframeApp>
            <IframeWallet />
          </IframeApp>
        </SignClientProvider>
      </WithBBWasm>
    </BBWasmProvider>
  </AztecSdkProvider>,
);
