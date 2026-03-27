

## Chat com Agente IA Especialista em Nutrição e Treinos

### O que será criado
Uma nova página `/nutri-coach` com um chat interativo onde o usuário conversa com um agente de IA especializado em nutrição e treinos. O agente terá contexto sobre as metas e dados do usuário (se logado).

### Mudanças

1. **Nova Edge Function `supabase/functions/nutri-coach-chat/index.ts`**
   - Usa `OPENAI_API_KEY` (já configurada) com streaming SSE
   - System prompt especializado em nutrição esportiva, dietas e treinos (em português)
   - Recebe array de mensagens do frontend e retorna stream de tokens
   - Suporte a contexto do usuário (metas diárias, se disponível)

2. **Nova página `src/pages/NutriCoach.tsx`**
   - Interface de chat com visual moderno (bolhas de mensagem, scroll automático)
   - Streaming token-by-token com renderização markdown (react-markdown)
   - Input fixo na parte inferior da tela
   - Histórico da conversa mantido em memória durante a sessão
   - Mensagem de boas-vindas do agente ao abrir

3. **`src/App.tsx`** — Adicionar rota `/nutri-coach` e item no navbar

### Technical detail
- Streaming via SSE usando OpenAI API diretamente (padrão já usado no projeto)
- Mensagens renderizadas com `react-markdown` para formatação rica
- System prompt inclui orientações sobre nutrição clínica, esportiva e planejamento de treinos
- Requer autenticação (usuário logado) para usar

