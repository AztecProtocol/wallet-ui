export {};

declare global {
  interface Window {
    web3: any;
    aztecSdk: any;
    handoverSession?: string;
    handoverAztecAccount?: string;
    PasswordCredential?: any;
  }
}
