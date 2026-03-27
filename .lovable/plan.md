

## Fix: Apple Health "Conectando..." Infinite Loading

### Problem
When clicking "Conectar Apple Health", the button stays stuck on "Conectando..." indefinitely. This happens because the native HealthKit plugin calls (`Health.isAvailable()` or `Health.requestAuthorization()`) may hang without resolving when the native plugin bridge isn't properly responding.

### Root Cause
The `@capgo/capacitor-health` plugin calls go through Capacitor's native bridge. If the native side doesn't respond (plugin not synced, not registered, or permission dialog dismissed without action), the Promise never resolves, leaving the UI stuck.

### Solution
Add timeout protection to the HealthKit operations and improve error handling.

### Changes

**1. `src/hooks/useHealthKit.ts`**
- Add a `withTimeout` utility that wraps any Promise with a configurable timeout (e.g., 10 seconds)
- Wrap `Health.isAvailable()`, `Health.requestAuthorization()`, and other native calls with this timeout
- If timeout fires, reject with a clear error so the UI can recover

```typescript
// Helper at top of file
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('HealthKit timeout')), ms)
    ),
  ]);
```

Apply to key calls:
```typescript
// In checkAvailability:
const { available } = await withTimeout(Health.isAvailable(), 10000);

// In requestPermissions:
await withTimeout(Health.requestAuthorization({...}), 15000);
```

**2. `src/components/HealthKitConnect.tsx`**
- No structural changes needed -- existing try/catch/finally in `handleConnect` will properly reset `connecting` state once the timeout rejects

### Post-fix testing
After implementing, the user should:
1. `npm run build && npx cap sync ios`
2. Clean Build Folder in Xcode (Cmd+Shift+K)
3. Run on device -- the connect button should either succeed or show an error toast within 10-15 seconds instead of hanging

