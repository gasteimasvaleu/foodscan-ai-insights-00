

## Re-enable Live Updates

The app crashed because the LiveUpdates plugin config was commented out in `capacitor.config.ts`. The native iOS code (`LiveUpdates.swift`) expects this config and crashes with `fatalError("Invalid LiveUpdate configuration...")` when it's missing.

### Change

**`capacitor.config.ts`** — uncomment the plugins block:

```ts
plugins: {
  LiveUpdates: {
    appId: 'f4605189',
    channel: 'Production',
    autoUpdateMethod: 'background',
    maxVersions: 3,
  },
},
```

### After implementation

1. `npm run build && npx cap sync ios`
2. Clean Build in Xcode → Run on device
3. The HealthKit diagnostic logs (with BUILD_ID) should now finally appear, since the correct bundle will load via OTA

