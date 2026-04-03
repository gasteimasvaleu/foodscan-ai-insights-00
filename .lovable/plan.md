

## Correção: Paywall reaparece após compra bem-sucedida

### Causa raiz encontrada

O problema **não** é o delay do RevenueCat em si. O `forceSubscriptionActive` funciona corretamente no momento da compra. O bug acontece **depois**:

1. Usuário compra → `forceSubscriptionActive(true)` → paywall some ✓
2. `finally` → `setPurchaseInProgress(false)`
3. Enquanto isso, o Supabase Auth faz um TOKEN_REFRESHED (refresh automático do token)
4. O `onAuthStateChange` recebe o evento e seta um novo objeto `user`
5. O `useEffect([user, authReady])` dispara novamente
6. Agora `purchaseInProgressRef.current` já é `false`
7. `checkSubscription()` consulta o banco — mas o webhook do RevenueCat pode ainda não ter gravado a assinatura no DB
8. Retorna `subscribed: false` → **sobrescreve o estado forçado** → paywall reaparece

### Solução

Adicionar uma **proteção temporal** no `AuthProvider.tsx`: após `forceSubscriptionActive`, guardar um timestamp e ignorar resultados de `checkSubscription` que contradigam o estado forçado por um período de segurança (ex: 60 segundos). Isso dá tempo ao webhook processar.

### Alteração

**`src/contexts/AuthProvider.tsx`**:
- Adicionar `forcedAtRef = useRef<number | null>(null)` para guardar o timestamp de quando o estado foi forçado
- No `forceSubscriptionActive`, setar `forcedAtRef.current = Date.now()`
- No `checkSubscription`, antes de aplicar o resultado: se `forcedAtRef.current` e `Date.now() - forcedAtRef.current < 60000` e o resultado atual é `subscribed: true`, **não sobrescrever** com um resultado `subscribed: false` do banco
- No useEffect de auto-check, mesma proteção: se forçado há menos de 60s, pular a verificação

Isso garante que o estado local forçado pela compra não seja derrubado por uma verificação que chega antes do webhook processar.

