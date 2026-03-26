import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.dietainteligente',
  appName: 'We Diet',
  webDir: 'dist',
  backgroundColor: '#ff2d9e',
  ios: {
    backgroundColor: '#ff2d9e',
    packageManager: 'cocoapods',
  },
  plugins: {
    LiveUpdates: {
      appId: 'd8f89897',
      channel: 'Production',
      autoUpdateMethod: 'background',
    },
  },
};

export default config;
