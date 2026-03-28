

# Plano: Buscar nome do perfil na tabela `profiles`

## Problema
`WelcomeMessage` e `AuthCard` usam `user.user_metadata?.name || user.email`, que mostra o email relay da Apple em vez do nome real.

## Alteracoes

### 1. `src/components/WelcomeMessage.tsx`
- Adicionar `useState` + `useEffect` para buscar `name` da tabela `profiles` usando `user.id`
- Exibir: `profileName || user.email`

### 2. `src/components/AuthCard.tsx` (trecho logado, ~linha 155)
- Mesma logica: buscar `name` de `profiles` via `useEffect`
- Substituir `user.user_metadata?.name || user.email` por `profileName || user.email`

## Sem mudancas no banco
A tabela `profiles` ja existe com campo `name`, o trigger `handle_new_user` ja cria o registro, e a pagina Profile ja permite editar o nome.

