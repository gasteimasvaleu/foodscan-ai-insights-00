

## Fix: OTA Cache Overriding Local Bundle + Visual Debug

### Root Cause

The `autoUpdateMethod: 'background'` in `capacitor.config.ts` causes the Live Updates plugin to apply the cached OTA snapshot **at the native layer**, before any JavaScript runs. So the `isLocalDev` check in `main.tsx` never executes because the old cached bundle (without that check) loads first. This is a chicken-and-egg problem.

The Xcode log confirms it: `[LiveUpdates] Platform: ios | Starting sync...` appears, meaning the old bundle ran (without the `isLocalDev` guard).

### Plan

**Step 1: Disable Live Updates in capacitor.config.ts**
- Comment out or remove the `LiveUpdates` plugin config entirely during development
- This prevents the native layer from applying any cached OTA bundle
- The user must then: delete the app from the iPhone, run `npx cap sync ios`, and reinstall via Xcode

**Step 2: Add visual build marker to FitTracker page**
- Show a small debug badge with a unique timestamp/ID on the FitTracker page
- This instantly confirms whether the new local bundle is active, without relying on console logs

**Step 3: Add on-screen debug status to HealthKitConnect**
- Instead of just "Conectando...", show the current step on screen: "Importing plugin...", "Checking availability...", "Requesting authorization..."
- The `useHealthKit` hook will expose a `debugStatus` string state
- This makes diagnosis possible even if Xcode console doesn't show JS logs

**Step 4: Expose debugStatus from useHealthKit**
- Add a `debugStatus` state variable updated at each step of `requestPermissions`
- Return it from the hook so `HealthKitConnect` can display it

### Files Changed
- `capacitor.config.ts` — remove LiveUpdates plugin config
- `src/pages/FitTracker.tsx` — add visible build marker
- `src/hooks/useHealthKit.ts` — add `debugStatus` state
- `src/components/HealthKitConnect.tsx` — display debug status on screen

### After Implementation
1. Delete the app from the iPhone
2. Run `npm run build && npx cap sync ios`
3. Open Xcode, build and run on device
4. Check the build marker appears on FitTracker
5. Tap "Conectar Apple Health" and read the on-screen status

