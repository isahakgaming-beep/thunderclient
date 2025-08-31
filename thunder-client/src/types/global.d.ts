export {};

declare global {
  interface Window {
    api: {
      invoke: (channel: string, args?: any) => Promise<any>;
      on: (channel: string, cb: (...args: any[]) => void): () => void;
      ping: () => Promise<string>;
    };
  }
}
