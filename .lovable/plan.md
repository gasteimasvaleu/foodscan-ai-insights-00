

## RevenueCat Webhook Edge Function

### Overview
Create a dedicated edge function `revenuecat-webhook` that receives server notifications from RevenueCat, updating the `subscribers` table automatically for renewals, cancellations, expirations, and refunds -- without depending on the user opening the app.

### How it works

RevenueCat sends POST requests with event data whenever a subscription status changes. The edge function validates the request, identifies the user, and updates the database accordingly.

### Edge Function: `supabase/functions/revenuecat-webhook/index.ts`

Handles these RevenueCat event types:
- **INITIAL_PURCHASE** -- mark as subscribed (backup if client-side sync missed)
- **RENEWAL** -- extend `subscription_end`
- **CANCELLATION** -- keep active until `subscription_end`, mark intent
- **EXPIRATION** -- set `subscribed: false`
- **BILLING_ISSUE** -- log warning, optionally flag
- **PRODUCT_CHANGE** -- update tier
- **REFUND** -- set `subscribed: false` immediately

Logic flow:
1. Parse the RevenueCat webhook payload
2. Validate with an authorization header (shared secret)
3. Extract `app_user_id` (which should be the Supabase `user_id`) and event type
4. Look up subscriber by `user_id` or `email`
5. Update `subscribers` table based on event type
6. Return 200 to acknowledge

### Config: `supabase/config.toml`

Add entry with `verify_jwt = false` (webhooks come from RevenueCat servers, not authenticated users).

### Secret needed

- **REVENUECAT_WEBHOOK_SECRET** -- an authorization bearer token set in RevenueCat's webhook config, used to validate incoming requests

### Client-side change: `src/hooks/useRevenueCat.ts`

Set the RevenueCat `appUserID` during `configure` so that webhook events contain the Supabase `user_id`:

```typescript
await Purchases.configure({ apiKey: RC_API_KEY, appUserID: user.id });
```

This requires moving `initRevenueCat` to run after `user` is available (already partially done since the hook receives `user`).

### Files to create/modify

| File | Change |
|---|---|
| `supabase/functions/revenuecat-webhook/index.ts` | New edge function handling all RevenueCat event types |
| `supabase/config.toml` | Add `[functions.revenuecat-webhook]` with `verify_jwt = false` |
| `src/hooks/useRevenueCat.ts` | Pass `user.id` as `appUserID` in `Purchases.configure()` |

### After deployment

You will need to configure RevenueCat to send webhooks to:
```
https://zyhmwcsfifdepqnnrguo.supabase.co/functions/v1/revenuecat-webhook
```

With the authorization header matching the `REVENUECAT_WEBHOOK_SECRET` secret.

