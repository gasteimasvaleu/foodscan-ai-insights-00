import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.dietainteligente',
  appName: 'We Diet',
  webDir: 'dist',
  backgroundColor: '#ff2d9e',
  server: {
    url: 'https://7af51b51-f57a-4397-be1b-b371107e8a01.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    backgroundColor: '#ff2d9e',
  },
};

export default config;
