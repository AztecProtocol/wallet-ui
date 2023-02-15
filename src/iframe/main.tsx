import render from '../components/render';
import getChainId from '../utils/getChainId';
import { BBWasmProvider, WithBBWasm } from '../utils/wasmContext';
import IframeWallet from './IframeWallet';

render(
  <BBWasmProvider>
    <WithBBWasm>
      <IframeWallet chainId={getChainId()} />
    </WithBBWasm>
  </BBWasmProvider>,
);
