import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { sync as liveUpdateSync } from '@capacitor/live-updates'
import App from './App.tsx'
import './index.css'

const isNative = Capacitor.isNativePlatform();

// Skip OTA Live Updates when running locally via Xcode (capacitor://localhost)
const isLocalDev = isNative && window.location.hostname === 'localhost';

if (isNative && !isLocalDev) {
  console.log('[LiveUpdates] Platform:', Capacitor.getPlatform(), '| Starting sync...');

  liveUpdateSync().then(result => {
    console.log('[LiveUpdates] Sync result:', JSON.stringify(result));
    if (result.activeApplicationPathChanged) {
      console.log('[LiveUpdates] New bundle ready – reloading WebView');
      try { sessionStorage.removeItem('splashShown'); } catch {}
      window.location.reload();
    }
  }).catch(err => console.warn('[LiveUpdates] Sync failed:', err));

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log('[LiveUpdates] App resumed – syncing...');
      liveUpdateSync().then(result => {
        console.log('[LiveUpdates] Foreground sync result:', JSON.stringify(result));
        if (result.activeApplicationPathChanged) {
          try { sessionStorage.removeItem('splashShown'); } catch {}
          window.location.reload();
        }
      }).catch(err => console.warn('[LiveUpdates] Foreground sync failed:', err));
    }
  });
} else if (isLocalDev) {
  console.log('[LiveUpdates] Skipped – running local Xcode build (localhost)');
}

// ─── Initialize RevenueCat on app start (native iOS only) ───
if (isNative && Capacitor.getPlatform() === 'ios') {
  import('./lib/revenuecat').then(({ initRevenueCat }) => {
    initRevenueCat()
      .then(() => console.log('[main] RevenueCat initialized at app start'))
      .catch(err => console.warn('[main] RevenueCat init error:', err));
  });
}

createRoot(document.getElementById("root")!).render(<App />);
