import render from '../components/render';
import getChainId from '../utils/getChainId';
import { BBWasmProvider, WithBBWasm } from '../utils/wasmContext';
import PopupWallet from './PopupWallet';

render(
  <BBWasmProvider>
    <WithBBWasm>
      <PopupWallet chainId={getChainId()} />
    </WithBBWasm>
  </BBWasmProvider>,
);
