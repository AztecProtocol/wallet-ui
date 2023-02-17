declare module '*.scss';
declare global {
  interface Window {
    web3: any;
    ethereum: any;
    aztecSdk: any;
    handoverSession?: string;
  }
}
