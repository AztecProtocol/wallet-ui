declare module '*.ttf';
declare module '*.woff';
declare module '*.woff2';
declare module '*.png';
declare module '*.svg';
declare module '*.scss';

declare global {
  interface Window {
    web3: any;
    ethereum: any;
    aztecSdk: any;
    handoverSession?: string;
    PasswordCredential?: any;
  }
}
