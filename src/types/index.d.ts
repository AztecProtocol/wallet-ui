import { AztecWalletProvider } from '@aztec/sdk';

declare global {
  interface Window {
    web3: any;
    ethereum: any;
    aztecWalletProvider: AztecWalletProvider;
  }
}
