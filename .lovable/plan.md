# Fase 3 — Defesa server-side da quota Freemium

Objetivo: impedir que um usuário no plano Free contorne o limite diário de 3 análises do FoodScan no iOS chamando as edge functions diretamente (bypass do front).

## Edge functions afetadas

1. `analyze-nutrition` (já tem `verify_jwt = false` por padrão)
2. `analyze-image`
3. `open-food-facts`
4. `identify-dish` (`verify_jwt = false` no config.toml)

## Regra de negócio (idêntica ao front)

Para cada chamada:

1. Validar JWT do usuário via `getClaims()` no header `Authorization`. Se ausente/inválido → **401**.
2. Identificar a plataforma do chamador via header `x-app-platform` (a ser enviado pelo front: `ios-native` | `web` | `android-native`).
3. Se NÃO for `ios-native` → processa normalmente (web/Hotmart e Android continuam livres).
4. Se for `ios-native`:
   - Buscar `subscribers` por `user_id` (service role). Se `subscribed === true` → processa normalmente.
   - Caso contrário, ler `daily_usage_limits` para `(user_id, feature='foodscan', usage_date=hoje)`.
     - Se `count >= 3` → **429** com `{ error: 'quota_exceeded', feature: 'foodscan' }`.
     - Senão, processa o pedido. **Se a resposta upstream for sucesso**, faz upsert/incremento atômico em `daily_usage_limits` (mesma lógica do hook), antes de devolver a resposta.
5. Em caso de erro upstream (OpenAI/OFF), NÃO incrementa.

`feature` será sempre `'foodscan'` nas 4 functions (a quota é compartilhada entre métodos de entrada — imagem, manual e código de barras — coerente com o limite de 3/dia visto pelo usuário).

## Implementação técnica

### 1. Helper compartilhado

Como edge functions Lovable mantêm tudo em `index.ts` (sem subpastas), vou inline um helper `checkAndIncrementQuota(req, supabaseAdmin)` em cada uma das 4 functions. Cópia controlada (~60 linhas) para preservar o padrão do projeto.

Assinatura interna:

```ts
async function enforceFoodscanQuota(req: Request): Promise<
  | { ok: true; userId: string | null; commit: () => Promise<void> }
  | { ok: false; response: Response }
>
```

- `ok: true` + `commit()` no-op → quando bypass (web/android, sem JWT opcional, ou subscriber).
- `ok: true` + `commit()` real → quando free iOS dentro da quota; chamamos depois do sucesso.
- `ok: false` → já contém a Response 401/429 a retornar.

Decisão importante: se o header `x-app-platform` não for `ios-native`, **bypass total** (sem exigir JWT) — preserva chamadas existentes de web e do app Android, e mantém o comportamento de funcionar para usuários não logados em fluxos antigos.

Se `x-app-platform === 'ios-native'` mas o JWT estiver ausente/inválido → 401.

### 2. Mudanças nas functions

Cada uma das 4 functions:
- Adicionar `'x-app-platform'` à lista de `Access-Control-Allow-Headers`.
- Criar `supabaseAdmin` com `SUPABASE_SERVICE_ROLE_KEY` (já secret).
- No início do handler (após CORS preflight, antes do trabalho pesado): chamar `enforceFoodscanQuota(req)`.
- Após sucesso (resposta 2xx), `await result.commit()` antes de responder.

### 3. Frontend

- `src/integrations/supabase/client.ts` (ou onde o cliente é criado): adicionar header global `x-app-platform` derivado do `Capacitor.getPlatform()` (`'ios' | 'android' | 'web'`) — mapeado para `ios-native` / `android-native` / `web`.
  - Alternativa mais segura: passar `headers` em cada `supabase.functions.invoke('...', { headers: { 'x-app-platform': platform } })`. Mas adicionar global em `createClient({ global: { headers } })` cobre tudo de uma vez.
- `src/pages/FoodScan.tsx`: nos 5 pontos que chamam `supabase.functions.invoke(...)`, tratar `error.context?.status === 429` (ou checar `data?.error === 'quota_exceeded'`) → `navigate('/assinar?reason=quota_exceeded&feature=foodscan')` e retornar sem mostrar erro genérico. Manter `await increment()` local (mantém UI sincronizada; a função é idempotente em caso de race com server-side, e o hook lê do mesmo backend no próximo refresh).

### 4. Versão iOS

- Bumpar `CURRENT_PROJECT_VERSION` de `19` para `20` em `ios/App/App.xcodeproj/project.pbxproj` (mantendo `MARKETING_VERSION 1.0.6`). Live Update cobre as edge functions e mudanças JS — o bump aqui é só para manter rastreabilidade.

## Salvaguardas

- `FREEMIUM_ENABLED = false` no front desativa a UI gated, **mas as edge functions continuam ativas**. Decisão: como a quota só dispara para `ios-native` + `!subscribed`, e nesse cenário queremos exatamente esse comportamento, isso é OK. Se for necessário desligar tudo, basta alterar a constante no front E re-deploy das functions com `ENABLE_FREEMIUM_QUOTA` lendo de env (deixo TODO de adicionar `ENABLE_FREEMIUM_QUOTA` como secret se quiser kill switch server-side — não vou criar agora para não esperar input).
- 7 assinantes atuais: protegidos pela checagem de `subscribers.subscribed`.
- Web e Android: protegidos pelo header `x-app-platform`.

## Plano de teste pós-deploy

1. Logado no preview web → fazer scan → não deve haver bloqueio (web bypass).
2. iOS free user (testflight) → 3 scans OK, 4º recebe 429 e é redirecionado para `/assinar?reason=quota_exceeded`.
3. iOS subscriber → ilimitado.
4. Sem JWT + header `ios-native` → 401.

## Arquivos alterados

- `supabase/functions/analyze-nutrition/index.ts`
- `supabase/functions/analyze-image/index.ts`
- `supabase/functions/open-food-facts/index.ts`
- `supabase/functions/identify-dish/index.ts`
- `src/integrations/supabase/client.ts` (adicionar header global)
- `src/pages/FoodScan.tsx` (tratamento de 429)
- `ios/App/App.xcodeproj/project.pbxproj` (build 20)

Sem novas migrations (tabela `daily_usage_limits` já existe da Fase 1).
