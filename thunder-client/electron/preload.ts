import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  invoke: (channel: string, args?: any) => ipcRenderer.invoke(channel, args),
  on: (channel: string, listener: (...args: any[]) => void) => {
    const sub = (_event: any, ...a: any[]) => listener(...a);
    ipcRenderer.on(channel, sub);
    // retourne une fonction pour se désabonner
    return () => ipcRenderer.removeListener(channel, sub);
  },
  ping: () => ipcRenderer.invoke('ping'),
});
