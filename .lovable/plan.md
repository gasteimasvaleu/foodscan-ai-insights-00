

## Plan: Add spacing between NotificationSettings and Configurações cards

### Change in `src/pages/Profile.tsx` (line 775)

The `NotificationSettings` component and the "Configurações" card are adjacent with no margin. The parent container likely uses `space-y-*` but the cards may need explicit spacing.

Let me check the parent container's classes to confirm.

Looking at the structure, line 775 has `<NotificationSettings />` immediately followed by the card at line 778. The parent div at ~line 791 should have spacing classes.

I need to check the parent wrapper.

**Fix:** The `NotificationSettings` component wraps its card in a React fragment (`<>`) with a hidden `PushNotificationSetup` ref before the Card. This fragment may be breaking the `space-y-*` gap on the parent. 

**Solution:** Add `mt-6` to the "Configurações" card at line 778 to ensure consistent spacing, or wrap the section with proper margin.

### File: `src/pages/Profile.tsx` (line 778)
- Add `mt-6` class to the Configurações card: `className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl mt-6"`

