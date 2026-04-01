import { registerPlugin } from '@capacitor/core';

export interface AppPlugin {
  addListener(
    eventName: 'appStateChange',
    listenerFunc: (state: { isActive: boolean }) => void
  ): Promise<{ remove: () => Promise<void> }>;
}

const CapacitorApp = registerPlugin<AppPlugin>('App');

export default CapacitorApp;
