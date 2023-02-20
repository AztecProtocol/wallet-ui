import '../components/index.scss';
import AppCard from '../components/AppCard';
import render from '../components/render';
import { AztecSdkProvider } from '../utils/aztecSdkContext';
import { getChainId } from '../utils/config';
import { BBWasmProvider, WithBBWasm } from '../utils/wasmContext';
import PopupWallet from './PopupWallet';

render(
  <AppCard>
    <AztecSdkProvider chainId={getChainId()}>
      <BBWasmProvider>
        <WithBBWasm>
          <PopupWallet />
        </WithBBWasm>
      </BBWasmProvider>
    </AztecSdkProvider>
  </AppCard>,
);
