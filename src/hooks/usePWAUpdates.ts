import { useState, useEffect, useCallback } from 'react';

interface PWAUpdateState {
  hasUpdate: boolean;
  isUpdating: boolean;
  updateError: string | null;
  waitingWorker: ServiceWorker | null;
}

export const usePWAUpdates = () => {
  const [updateState, setUpdateState] = useState<PWAUpdateState>({
    hasUpdate: false,
    isUpdating: false,
    updateError: null,
    waitingWorker: null,
  });

  // Preserve critical app state before update
  const preserveAppState = useCallback(() => {
    try {
      // Get current forms data if any
      const formData = document.querySelectorAll('form');
      const preservedData: Record<string, any> = {};
      
      formData.forEach((form, index) => {
        const formDataObj = new FormData(form);
        const formEntries: Record<string, any> = {};
        formDataObj.forEach((value, key) => {
          formEntries[key] = value;
        });
        if (Object.keys(formEntries).length > 0) {
          preservedData[`form_${index}`] = formEntries;
        }
      });

      // Save current route
      preservedData.currentRoute = window.location.pathname;
      preservedData.timestamp = Date.now();

      if (Object.keys(preservedData).length > 1) {
        localStorage.setItem('pwa_update_preserved_state', JSON.stringify(preservedData));
      }
    } catch (error) {
      console.warn('Failed to preserve app state:', error);
    }
  }, []);

  // Restore preserved state after update
  const restoreAppState = useCallback(() => {
    try {
      const preserved = localStorage.getItem('pwa_update_preserved_state');
      if (preserved) {
        const data = JSON.parse(preserved);
        // Check if data is recent (within 5 minutes)
        if (Date.now() - data.timestamp < 5 * 60 * 1000) {
          console.log('Restored app state after PWA update:', data);
          // Custom event for components to listen to state restoration
          window.dispatchEvent(new CustomEvent('pwa-state-restored', { detail: data }));
        }
        localStorage.removeItem('pwa_update_preserved_state');
      }
    } catch (error) {
      console.warn('Failed to restore app state:', error);
    }
  }, []);

  // Apply the waiting update
  const applyUpdate = useCallback(async () => {
    if (!updateState.waitingWorker) return false;

    try {
      setUpdateState(prev => ({ ...prev, isUpdating: true, updateError: null }));
      
      // Preserve current state
      preserveAppState();

      // Tell the waiting service worker to skip waiting
      updateState.waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      
      return true;
    } catch (error) {
      console.error('Error applying update:', error);
      setUpdateState(prev => ({ 
        ...prev, 
        isUpdating: false, 
        updateError: 'Erro ao aplicar atualização' 
      }));
      return false;
    }
  }, [updateState.waitingWorker, preserveAppState]);

  // Dismiss the update notification
  const dismissUpdate = useCallback(() => {
    setUpdateState(prev => ({
      ...prev,
      hasUpdate: false,
      waitingWorker: null,
      updateError: null,
    }));
  }, []);

  useEffect(() => {
    // Restore state on app load
    restoreAppState();

    if ('serviceWorker' in navigator) {
      const handleControllerChange = () => {
        // Reload to apply the new service worker
        window.location.reload();
      };

      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          setUpdateState(prev => ({
            ...prev,
            hasUpdate: true,
            waitingWorker: event.data.waitingWorker,
          }));
        }
      };

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      navigator.serviceWorker.addEventListener('message', handleMessage);

      // Check for updates on load
      navigator.serviceWorker.ready.then(registration => {
        // Check for updates periodically
        const checkForUpdates = () => {
          registration.update().catch(console.error);
        };

        // Check for updates every 30 minutes
        const interval = setInterval(checkForUpdates, 30 * 60 * 1000);

        // Listen for waiting service worker
        if (registration.waiting) {
          setUpdateState(prev => ({
            ...prev,
            hasUpdate: true,
            waitingWorker: registration.waiting,
          }));
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateState(prev => ({
                  ...prev,
                  hasUpdate: true,
                  waitingWorker: newWorker,
                }));
              }
            });
          }
        });

        return () => {
          clearInterval(interval);
          navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
          navigator.serviceWorker.removeEventListener('message', handleMessage);
        };
      });
    }
  }, [restoreAppState]);

  return {
    ...updateState,
    applyUpdate,
    dismissUpdate,
  };
};