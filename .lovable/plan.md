## /nutricionista-que-vende — MVP simplificado (sem Instagram API)

Pulando toda a integração com Meta/Instagram. O usuário **gera o conteúdo com IA**, **baixa a imagem** e **copia a legenda** para postar manualmente no Instagram.

### O que entra

**Rota:** `/nutricionista-que-vende` (protegida por `ProRoute`, disponível a todos usuários Pro)

**Fluxo principal:**
1. Usuário escolhe tipo de post (Carrossel educativo, Dica rápida, Receita, Antes/Depois, Story, Reel script)
2. Descreve o tema em 1 frase (ex: "benefícios da proteína no café da manhã")
3. Escolhe tom (Profissional, Descontraído, Motivacional) e público (Emagrecimento, Hipertrofia, Saúde geral, Gestantes…)
4. IA gera:
   - **Legenda** completa pronta para colar
   - **Hashtags** sugeridas (15–20)
   - **Imagem** do post (gerada via IA, fundo + texto principal)
   - **CTA** final
5. Tela de resultado com:
   - Preview da imagem
   - Botão **Baixar imagem** (PNG, formato 1080×1080 ou 1080×1350)
   - Botão **Copiar legenda** (com hashtags)
   - Botão **Compartilhar** nativo (Web Share API / Capacitor Share)
   - Botão **Regenerar** (legenda / imagem separadamente)
   - Botão **Salvar no histórico**

**Histórico de posts:**
- Aba "Meus posts" listando o que o usuário já gerou
- Cada item: thumbnail, tema, data, ações (baixar de novo, copiar legenda, duplicar, excluir)

**Calendário/sugestões (light):**
- Card com **5 ideias da semana** geradas pela IA conforme nicho do usuário
- Clique numa ideia → preenche o formulário e gera

### O que fica fora

- ❌ OAuth Instagram / Meta Developers
- ❌ Edge function `instagram-webhook`
- ❌ Agendamento real de publicação
- ❌ Métricas (likes, alcance, comentários)
- ❌ Resposta automática a comentários/DMs

Tudo isso pode entrar numa V2 se fizer sentido.

### Detalhes técnicos

**Tabelas novas (uma migration):**

```text
generated_posts
  id uuid pk
  user_id uuid → public.profiles(id)
  post_type text          -- carrossel, dica, receita, antes_depois, story, reel
  theme text              -- prompt do usuário
  tone text
  audience text
  caption text            -- legenda gerada
  hashtags text[]
  image_url text          -- storage público
  cta text
  created_at timestamptz default now()

post_ideas_weekly
  id uuid pk
  user_id uuid → public.profiles(id)
  week_start date
  ideas jsonb             -- [{title, hook, post_type}, ...]
  created_at timestamptz default now()
```

RLS: dono lê/escreve/apaga apenas os próprios registros.

**Storage bucket:** `social-posts` (público, leitura anônima, escrita autenticada do dono via pasta `{user_id}/`).

**Edge functions novas:**
- `generate-social-caption` — recebe `{post_type, theme, tone, audience}`, chama Lovable AI Gateway (`google/gemini-2.5-flash`), retorna `{caption, hashtags, cta}`
- `generate-social-image` — recebe `{theme, post_type, style}`, gera imagem via `gemini-2.5-flash-image-preview` (Lovable AI), salva em `social-posts/{user_id}/...png`, retorna URL pública
- `generate-weekly-ideas` — retorna 5 sugestões textuais para a semana

Tudo via `LOVABLE_API_KEY` (já existe). Nenhum secret novo.

**Componentes novos (`src/pages/NutricionistaQueVende.tsx` + `src/components/nutri-sells/`):**
- `PostGeneratorForm.tsx` — formulário inicial
- `PostResultCard.tsx` — preview + ações (baixar/copiar/compartilhar)
- `PostHistoryGrid.tsx` — histórico
- `WeeklyIdeasCard.tsx` — sugestões
- `hooks/useGeneratedPosts.ts`

**Download/cópia (frontend puro):**
- Copiar legenda: `navigator.clipboard.writeText(caption + "\n\n" + hashtags.join(" "))`
- Baixar imagem: fetch da `image_url` → blob → `URL.createObjectURL` → `<a download>` (no Capacitor usa `@capacitor/filesystem` + `Share`)
- Compartilhar: Web Share API com fallback

**Rota:**
- Adicionar `<Route path="/nutricionista-que-vende" element={<ProRoute><NutricionistaQueVende /></ProRoute>} />` em `App.tsx`
- Entrada no Menu "+" (BottomPlusMenu) na seção apropriada

### Confirma para eu implementar?
