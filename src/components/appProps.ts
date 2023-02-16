import { AztecChainId, EthereumChainId } from '../utils/config';

export interface AppProps {
  chainId: EthereumChainId;
  aztecChainId: AztecChainId;
}
