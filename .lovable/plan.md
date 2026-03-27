

## Remover notificações push web/PWA

### Alterações

#### 1. Deletar arquivos
- `src/pages/AdminNotifications.tsx`
- `src/components/NotificationSettings.tsx`
- `src/components/PushNotificationSetup.tsx`

#### 2. `src/App.tsx`
- Remover import de `PushNotificationSetup` e `AdminNotifications`
- Remover `<PushNotificationSetup />` do JSX
- Remover rota `/admin/notificacoes`

#### 3. `src/pages/Profile.tsx`
- Remover import de `NotificationSettings`
- Remover `<NotificationSettings />` do JSX

#### 4. `src/components/AuthCard.tsx`
- Remover import de `PushNotificationSetup` e `PushNotificationSetupRef`
- Remover `pushNotificationRef` e `<PushNotificationSetup ref={pushNotificationRef} />`

