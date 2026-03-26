

## Update AppFlow Config with New App ID

The build is failing because `appflow.config.json` still references the old app ID `d8f89897` instead of the new Capacitor app ID `f4605189`.

### Change

**File: `appflow.config.json`**
- Replace `"appId": "d8f89897"` with `"appId": "f4605189"`

That's it — single line change. After this, the AppFlow build should pass the `get_appflow_config` step.

