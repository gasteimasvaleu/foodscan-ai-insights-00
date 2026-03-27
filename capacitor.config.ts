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
      appId: 'f4605189',
      channel: 'Production',
      autoUpdateMethod: 'background',
      maxVersions: 3,
    },
  },
};

export default config;
