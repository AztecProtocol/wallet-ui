import render from '../components/render';
import getChainId from '../utils/getChainId';
import { WithBBWasm } from '../utils/wasmContext';
import IframeWallet from './IframeWallet';

render(
  <WithBBWasm>
    <IframeWallet chainId={getChainId()} />
  </WithBBWasm>,
);
