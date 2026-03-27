

## Fix: Install Missing Native HealthKit Pod

### Root Cause
The `@capgo/capacitor-health` npm package is installed (v8.4.1 in `package.json`), but the **native iOS pod was never added**. The `Podfile.lock` only lists Capacitor core and RevenueCat — no health plugin. This is why `Health` imports as `{}`: the JavaScript wrapper loads, but there's no native bridge behind it.

### Plan

**No code changes needed in Lovable.** This is a local native setup issue.

The user needs to run these commands in their local project:

```bash
npm run build
npx cap sync ios
cd ios/App && pod install
```

Then open Xcode and rebuild. After this:
- `Podfile.lock` should show `CapgoCapacitorHealth` 
- `Health` will no longer be `{}`
- The HealthKit permission prompt should appear

If `npx cap sync` doesn't auto-add the pod, manually add this line to `ios/App/Podfile` inside `capacitor_pods`:
```ruby
pod 'CapgoCapacitorHealth', :path => '../../node_modules/@capgo/capacitor-health'
```

### After Running
1. Verify `Podfile.lock` now includes `CapgoCapacitorHealth`
2. Build and run on physical iPhone via Xcode
3. Tap "Conectar Apple Health" — the native permission dialog should appear
4. Share Xcode logs if it still fails

