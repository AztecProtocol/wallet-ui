import render from '../components/render';
import { AztecSdkProvider } from '../utils/aztecSdkContext';
import { getChainId } from '../utils/config';
import { BBWasmProvider, WithBBWasm } from '../utils/wasmContext';
import PopupWallet from './PopupWallet';

render(
  <AztecSdkProvider chainId={getChainId()}>
    <BBWasmProvider>
      <WithBBWasm>
        <PopupWallet />
      </WithBBWasm>
    </BBWasmProvider>
  </AztecSdkProvider>,
);
