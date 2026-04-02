

## Mensagem Motivacional Diária via WhatsApp — Página Sono

### O que será construído
Um card na página `/sono` onde o usuário seleciona uma categoria de mensagem motivacional. Às 6:00 BRT, um cron job dispara uma edge function que usa IA (Lovable AI) para gerar uma mensagem personalizada e envia via Z-API/WhatsApp.

### Categorias de mensagem
- **Gratidão** — Mensagens de gratidão e reflexão matinal
- **Energia** — Motivação para começar o dia com energia
- **Saúde** — Dicas e incentivos sobre hábitos saudáveis
- **Foco** — Mensagens sobre produtividade e foco
- **Superação** — Frases de superação e resiliência

### Alterações

**1. Migration SQL — coluna `motivational_category` na tabela `profiles`**
- Adicionar `motivational_category text default null` à tabela `profiles`
- Quando `null`, o recurso está desativado; quando preenchido, indica a categoria escolhida

**2. Card na página Sleep.tsx**
- Novo card "Mensagem Motivacional" com ícone de sol/estrela
- RadioGroup ou botões-chip para selecionar a categoria
- Botão para ativar/desativar
- Salva a preferência na coluna `motivational_category` do perfil
- Nota: requer WhatsApp verificado (mostrar aviso se não configurado)

**3. Nova Edge Function `whatsapp-motivational`**
- Busca todos os perfis com `motivational_category IS NOT NULL`
- Para cada usuário, busca o WhatsApp verificado
- Chama a Lovable AI Gateway (`google/gemini-3-flash-preview`) com prompt baseado na categoria + dados de sono recentes do usuário (média, qualidade)
- Envia a mensagem gerada via Z-API
- Registra na tabela `whatsapp_messages` com `message_type = 'motivational'`

**4. Cron job (SQL insert via insert tool)**
- `cron.schedule` para executar diariamente às 09:00 UTC (6:00 BRT)
- Chama `whatsapp-motivational` via `net.http_post`

### Detalhes Técnicos

**Edge Function — prompt da IA:**
```
Sistema: Você é um coach motivacional. Gere UMA mensagem curta (máx 200 chars) 
na categoria "{categoria}" para alguém que dormiu em média {avg}h com qualidade 
{quality}/5 nos últimos 7 dias. Seja empático, positivo e use emojis.
```

**Arquivos a criar/editar:**
- `supabase/functions/whatsapp-motivational/index.ts` — nova edge function
- `src/pages/Sleep.tsx` — adicionar card de seleção de categoria
- Migration para adicionar coluna `motivational_category` em `profiles`
- SQL insert para criar o cron job

**Padrão reutilizado:** Mesma estrutura de envio do `whatsapp-send-reminders` (Z-API + service role key), mesma autenticação Lovable AI do `nutri-coach-chat`.

