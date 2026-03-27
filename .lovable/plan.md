

## Diagnose and Fix Apple Health Connection Hang

### Analysis

From the Xcode logs, there are no `⚡️ To Native -> Health` entries, meaning the HealthKit plugin is never called natively. The button shows "Conectando..." indefinitely. The `requestPermissions` function in `useHealthKit.ts` could be hanging at:

1. The dynamic import `await import('@capgo/capacitor-health')`
2. `Health.isAvailable()` (has 10s timeout, but may not be triggering)
3. `Health.requestAuthorization()` (has 15s timeout)

Other Xcode log notes (non-blocking):
- RevenueCat is working correctly but products are `WAITING_FOR_REVIEW` (expected, not an error)
- LiveUpdates syncing from cache successfully
- `DialogContent` accessibility warning is cosmetic
- WEBP image error is cosmetic

### Plan

**File: `src/hooks/useHealthKit.ts`**

Add detailed `console.log` statements at each step of `requestPermissions` and `checkAvailability` to identify exactly where it hangs:

- Log entry into `requestPermissions` and the value of `isSupported`
- Log before/after the dynamic import of `@capgo/capacitor-health`
- Log the result of `Health.isAvailable()`
- Log before/after `Health.requestAuthorization()`
- Log all catch blocks with the actual error

Also add a log in `getHealthPlugin` to show whether the import succeeds or fails.

These logs will appear in the Xcode console when you tap "Conectar Apple Health", letting us pinpoint exactly which call hangs or fails.

### After Implementation

1. Run `npm run build && npx cap sync ios && npx cap open ios`
2. Build and run on the physical iPhone
3. Tap "Conectar Apple Health" and share the new Xcode logs

