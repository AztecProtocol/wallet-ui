declare module '*.ttf';
declare module '*.woff';
declare module '*.woff2';
declare module '*.png';
declare module '*.svg';
declare module '*.scss';

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
