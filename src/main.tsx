import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { sync as liveUpdateSync } from '@capacitor/live-updates'
import { App as CapApp } from '@capacitor/app'
import App from './App.tsx'
import './index.css'

if (Capacitor.isNativePlatform()) {
  liveUpdateSync().then(result => {
    if (result.activeApplicationPathChanged) {
      window.location.reload();
    }
  }).catch(err => console.warn('Live Updates sync failed:', err));

  CapApp.addListener('resume', async () => {
    try {
      const result = await liveUpdateSync();
      if (result.activeApplicationPathChanged) {
        window.location.reload();
      }
    } catch (err) {
      console.warn('Live Updates sync on resume failed:', err);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
