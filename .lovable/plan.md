## Freemium iOS com Feature Flag — Execução em 3 fases

Princípio: tudo atrás de `FREEMIUM_ENABLED`. Se algo quebrar em produção, troca `true → false` e sobe Live Update via Appflow (~5 min). Os 7 assinantes atuais nunca são bloqueados — toda checagem começa com `if (subscribed) → liberado`.

---

### Fase 1 — Infraestrutura invisível (zero risco)

**Migration:**
- Tabela `daily_usage_limits` (id, user_id uuid NOT NULL, feature text NOT NULL, usage_date date NOT NULL, count int NOT NULL default 0, created_at, updated_at)
- Unique `(user_id, feature, usage_date)`, index igual
- RLS: usuário só vê/edita os próprios

**Arquivos novos:**
- `src/config/freemium.ts` — `FREEMIUM_ENABLED = true`, `FOODSCAN_DAILY_LIMIT = 3`
- `src/hooks/useDailyLimit.ts` — `{ count, remaining, canUse, increment }`. Se `!FREEMIUM_ENABLED` ou `subscribed` ou não-iOS-nativo → `canUse: true`, `increment` no-op
- `src/components/ProRoute.tsx` — wrapper que redireciona para `/assinar?reason=&feature=` se gated
- `src/pages/Paywall.tsx` — página com header + botão X (navigate(-1) ou /), lê `?reason=` e `?feature=` para mensagem contextual; renderiza `PaywallScreen`

App funciona idêntico a hoje após esta fase.

---

### Fase 2 — Liberar app para free + paywall sob demanda

**`src/App.tsx`:**
- Adicionar rota `/assinar` → `<Paywall />`
- `AuthAwareNavbar`: se `FREEMIUM_ENABLED` mostra sempre que logado
- Envolver com `<ProRoute>`: `/fit-tracker`, `/masterchef`, `/treinos`, `/nutri-coach`, `/receitas`, `/faca-em-casa`, `/provador`, `/jejum`, `/sono`, `/apple-health`, `/profile/diets`, `/whatsapp-settings`, `/graficos-progresso`, `/objetivos`, `/hidratacao`
- `/foodscan` fica livre (com quota)

**`src/pages/Index.tsx`:**
- Se `FREEMIUM_ENABLED` → dashboard normal mesmo sem assinatura
- Senão → comportamento atual

**`src/components/QuickActions.tsx` (revisado conforme conversa):**
| Card | Rota | Status |
|---|---|---|
| Escanear Comida | `/foodscan` | Livre (quota 3/dia) |
| Registrar Exercício | `/fit-tracker` | Pro 🔒 |
| Gerar Cardápio | `/masterchef` | Pro 🔒 |
| Treinos | `/treinos` | Pro 🔒 |
| WhatsApp | `/whatsapp-settings` | Pro 🔒 |

- Free + iOS + Pro card → navega `/assinar?reason=feature_locked&feature=<slug>`
- Ícone de cadeado no canto (só se gated)

**`src/pages/FoodScan.tsx`:**
- `useDailyLimit('foodscan', 3)`
- Antes de invocar `analyze-nutrition | analyze-image | open-food-facts | identify-dish`: se `!canUse` → `/assinar?reason=quota_exceeded`
- Após sucesso → `increment()`
- Contador no topo: "X/3 análises grátis hoje" (só free + iOS)

Salvaguarda: `subscribed === true` → `canUse: true`. Os 7 pagos passam direto.

---

### Fase 3 — Defesa em profundidade no servidor

Edge functions: `analyze-nutrition`, `analyze-image`, `open-food-facts`, `identify-dish`.

Cada uma:
1. Pega `user_id` do JWT
2. Se `subscribed` na tabela `subscribers` → processa normal
3. Senão conta `daily_usage_limits` para `(user_id, feature, hoje)`
4. Se `count >= 3` → 429 `{ error: 'quota_exceeded' }`
5. Senão processa e incrementa via service role

Frontend trata 429 → `/assinar?reason=quota_exceeded`.

---

### Versionamento iOS

`ios/App/App.xcodeproj/project.pbxproj`: subir para `1.0.6 (19)` (4 ocorrências de cada chave: Debug+Release × App+Widget). A 1.0.5 (18) já foi enviada.

---

### Rollback

1. `FREEMIUM_ENABLED = false` em `src/config/freemium.ts`
2. Live Update via Appflow (~5 min)
3. App volta ao paywall full-screen para não-assinantes

Os 7 assinantes não sentem nada em momento algum.

---

### Fora de escopo

- Mudanças de preço, plano anual, trial
- Reformulação do conteúdo do paywall
- Hotmart / web — só iOS

---

### Estrutura final

```text
src/
├── config/freemium.ts                [novo]
├── hooks/useDailyLimit.ts            [novo]
├── components/
│   ├── ProRoute.tsx                  [novo]
│   └── QuickActions.tsx              [gates Pro + cadeado]
├── pages/
│   ├── Paywall.tsx                   [novo]
│   ├── Index.tsx                     [remove branch paywall]
│   ├── FoodScan.tsx                  [quota check]
│   └── App.tsx                       [rotas + navbar + ProRoute]
supabase/
├── migrations/[nova]_create_daily_usage_limits.sql
└── functions/{analyze-nutrition,analyze-image,open-food-facts,identify-dish}/  [Fase 3]
ios/App/App.xcodeproj/project.pbxproj   [1.0.6 (19)]
```

Executo as 3 fases em sequência num único loop, terminando com bump de versão iOS.
