import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.dietainteligente',
  appName: 'We Diet',
  webDir: 'dist',
  backgroundColor: '#ff2d9e',
  ios: {
    backgroundColor: '#ff2d9e',
    packageManager: 'cocoapods',
    // Permite que <video playsInline> toque inline no WKWebView, sem
    // forçar fullscreen com controles nativos (botão de play do iOS).
    allowsInlineMediaPlayback: true,
    // Permite autoplay de mídia sem exigir gesto do usuário — essencial
    // pro splash em vídeo dar play automático ao abrir o app.
    mediaTypesRequiringUserActionForPlayback: 'none',
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
