import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { sync as liveUpdateSync } from '@capacitor/live-updates'
import App from './App.tsx'
import './index.css'

const isNative = Capacitor.isNativePlatform();

if (isNative) {
  // ── Live Updates (OTA) ──
  console.log('[LiveUpdates] Platform:', Capacitor.getPlatform(), '| Starting sync...');

  liveUpdateSync().then(result => {
    console.log('[LiveUpdates] Sync result:', JSON.stringify(result));
    if (result.activeApplicationPathChanged) {
      console.log('[LiveUpdates] New bundle ready – reloading WebView');
      window.location.reload();
    }
  }).catch(err => console.warn('[LiveUpdates] Sync failed:', err));

  // Re-sync when the app comes back to foreground
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log('[LiveUpdates] App resumed – syncing...');
      liveUpdateSync().then(result => {
        console.log('[LiveUpdates] Foreground sync result:', JSON.stringify(result));
        if (result.activeApplicationPathChanged) {
          window.location.reload();
        }
      }).catch(err => console.warn('[LiveUpdates] Foreground sync failed:', err));
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
