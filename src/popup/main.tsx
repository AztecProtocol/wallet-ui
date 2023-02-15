import render from '../components/render';
import getChainId from '../utils/getChainId';
import { WithBBWasm } from '../utils/wasmContext';
import PopupWallet from './PopupWallet';

render(
  <WithBBWasm>
    <PopupWallet chainId={getChainId()} />
  </WithBBWasm>,
);
