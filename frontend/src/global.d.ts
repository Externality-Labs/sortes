declare module '*.pdf';

declare interface Window {
  ethereum: any;
  __APP_METADATA_READY__: Promise<void>;
  __APP_METADATA__: {
    tokens: Tokens;
    abi: {
      [key: string]: string[];
    };
  };
}
