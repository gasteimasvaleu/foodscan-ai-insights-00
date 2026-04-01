declare module '@capacitor/app' {
  export interface AppState {
    isActive: boolean;
  }

  export interface PluginListenerHandle {
    remove: () => Promise<void>;
  }

  export const App: {
    addListener(
      eventName: 'appStateChange',
      listenerFunc: (state: AppState) => void
    ): Promise<PluginListenerHandle>;
  };
}
