import render from '../components/render';
import { getAztecChainId, getChainId } from '../utils/config';
import { BBWasmProvider, WithBBWasm } from '../utils/wasmContext';
import IframeWallet from './IframeWallet';

render(
  <BBWasmProvider>
    <WithBBWasm>
      <IframeWallet chainId={getChainId()} aztecChainId={getAztecChainId()} />
    </WithBBWasm>
  </BBWasmProvider>,
);
