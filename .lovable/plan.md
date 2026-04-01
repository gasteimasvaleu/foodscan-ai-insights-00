

## Adicionar aviso de WhatsApp nas páginas Objetivos, Jejum e Profile (Lembretes)

### Resumo

Criar um componente reutilizável de aviso que verifica se o usuário tem WhatsApp configurado e verificado. Se não tiver, exibe um banner convidando a habilitar. O banner terá um link/botão para `/whatsapp-settings`.

### 1. Novo componente: `src/components/WhatsAppNotice.tsx`

Um banner compacto que:
- Consulta `whatsapp_subscriptions` para verificar se o usuário tem uma assinatura com `is_verified = true`
- Se **não** tiver, exibe um card com ícone do WhatsApp, texto curto e botão "Configurar"
- Se já tiver WhatsApp verificado, **não renderiza nada**
- Aceita uma prop opcional `className` para espaçamento

Estilo: card sutil com fundo amarelo/âmbar claro, ícone verde do WhatsApp, texto curto como "Habilite o WhatsApp para receber notificações desta página", botão linkando para `/whatsapp-settings`.

### 2. Inserir o componente nas 3 páginas

- **`src/pages/Objetivos.tsx`**: Logo abaixo do header card (após linha 41), antes do card de progresso semanal
- **`src/pages/IntermittentFasting.tsx`**: Logo abaixo do header card (após linha 225), antes do Timer Card
- **`src/pages/Profile.tsx`**: Logo abaixo do `<RemindersCard>`, dentro da seção de Lembretes

### Detalhes técnicos

- O componente usa `useState` + `useEffect` para buscar `whatsapp_subscriptions` onde `user_id = userId` e `is_verified = true`
- Se a query retornar resultado, o componente retorna `null`
- Usa `useNavigate` para o botão "Configurar" redirecionar para `/whatsapp-settings`
- Recebe `userId: string` como prop obrigatória

