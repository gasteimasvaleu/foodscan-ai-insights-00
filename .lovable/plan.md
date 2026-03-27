

## Dashboard Admin com Assinaturas Promocionais

### Estrutura

#### 1. Criar pagina `src/pages/AdminDashboard.tsx`
Dashboard central admin com cards de navegacao para as sub-paginas:
- **Treinos** (`/admin/treinos`) - gerenciamento de conteudo de treinos
- **Assinaturas Promocionais** (`/admin/assinaturas-promocionais`) - envio de tokens via email

Inclui verificacao de role admin (reutilizando `has_role` RPC). Layout com header "Painel Administrativo", grid de cards clicaveis com icones (Dumbbell, Gift/Tag).

#### 2. Criar pagina `src/pages/AdminSubscriptions.tsx`
Formulario para enviar tokens promocionais chamando a edge function `send-registration-token`:
- Campos: Nome, Email, Tipo de plano (Mensal/Anual)
- Botao "Enviar Convite"
- Chama `supabase.functions.invoke('send-registration-token', { body: { email, name, plan_type } })`
- Lista de tokens ja enviados (query na tabela `registration_tokens`) com status (usado/pendente/expirado)
- Verificacao de admin role

#### 3. Atualizar `src/App.tsx`
- Adicionar imports das novas paginas
- Adicionar rotas:
  - `/admin` -> `AdminDashboard`
  - `/admin/assinaturas-promocionais` -> `AdminSubscriptions`
  - Manter `/admin/treinos` -> `AdminTreinos`

#### 4. Sem alteracoes no banco
A edge function `send-registration-token` ja existe e funciona. A tabela `registration_tokens` ja tem as colunas necessarias. Apenas precisamos de uma policy SELECT para admins verem todos os tokens (hoje so permite ver tokens validos nao usados).

#### 5. Migration: adicionar policy para admins lerem todos os tokens
```sql
CREATE POLICY "Admins can view all registration tokens"
ON public.registration_tokens
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

