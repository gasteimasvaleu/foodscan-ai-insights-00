# Fix Appflow Live Update build (EALLOWREMOTE)

## Cause
The package list file (package-lock.json) has 81 packages pointing to a Lovable-internal download address instead of the public npm registry. Appflow's npm refuses those addresses, so `npm install` stops. Because install failed, TypeScript was never installed, which triggers the second error ("Could not find installation of TypeScript").

## Fix
1. In `package-lock.json`, replace every `https://europe-west1-npm.pkg.dev/lovable-core-prod/sandbox-npm-cache/` URL with `https://registry.npmjs.org/` (same package paths, `/-/name-x.y.z.tgz` format matches).
2. Verify no `sandbox-npm-cache` references remain and the JSON is valid.
3. No other code changes; TypeScript is already in package.json and will install once npm install succeeds.

## After
Run the Live Update build in Appflow again. If future dependency changes reintroduce these URLs, the same replacement is needed (will record this in AGENTS.md).
