

## Atualização em tempo real do nome do perfil

### O que será feito
Adicionar listeners Supabase Realtime nos componentes `WelcomeMessage` e `AuthCard` para que o nome exibido na página principal atualize automaticamente quando alterado no Perfil.

### Pré-requisito (manual)
Habilitar Realtime na tabela `profiles` no dashboard Supabase: **Database → Replication → habilitar `profiles`**.

### Alterações

**1. `src/components/WelcomeMessage.tsx`**
- No `useEffect` existente, após o fetch inicial, adicionar um `supabase.channel('welcome-profile')` com listener `postgres_changes` filtrado por `event: 'UPDATE'`, `table: 'profiles'`, `filter: id=eq.{user.id}`
- No callback, atualizar `setProfileName(payload.new.name)`
- Cleanup: `supabase.removeChannel(channel)` no return

**2. `src/components/AuthCard.tsx`**
- No `useEffect` que busca o profile (linhas ~94-102), adicionar o mesmo padrão com `supabase.channel('authcard-profile')` e listener `postgres_changes` filtrado pelo `user.id`
- Atualizar `setProfileName(payload.new.name)` no callback
- Cleanup no return do useEffect

Ambos os canais usam nomes distintos para evitar conflito. O padrão é idêntico nos dois componentes.

