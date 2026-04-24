

## Página /provador — "Provador Virtual" com IA

Página de entretenimento onde o usuário envia **2 fotos** (1 dele + 1 de uma peça de roupa/look) e a IA gera uma imagem fotorrealista do usuário vestindo aquela roupa, em fundo branco de estúdio, formato 9:16.

---

### Comportamento da página

1. **Header padrão** (compacto horizontal, gradiente, título rosa #FD46A1) — "Provador Virtual".
2. **Texto curto explicativo**: "Envie sua foto e a foto de uma roupa. A IA cria você usando o look em fundo de estúdio."
3. **Dois slots de upload lado a lado** (em mobile: empilhados):
   - **Slot A — "Sua foto"**: foto do usuário (rosto + corpo de preferência).
   - **Slot B — "A roupa"**: foto de referência da peça/look.
   - Ambos aceitam JPG/PNG/WEBP até 8 MB, com preview e botão "trocar".
   - Compressão client-side via `lib/imageCompression.ts` (já existe).
4. **Botão "Provar look"** (rosa #FD46A1, full width, disabled enquanto faltar foto).
5. **Loading**: usa o `VideoOverlay` global existente (z-60) com texto "Gerando seu look…".
6. **Resultado**:
   - Card grande exibindo a imagem 9:16 gerada.
   - Botões: **Baixar**, **Compartilhar no WhatsApp**, **Refazer** (limpa tudo), **Trocar roupa** (mantém foto do usuário).
7. **Aviso legal**: "Imagem gerada por IA, apenas para entretenimento. Não envie fotos de terceiros sem consentimento."

---

### Geração de imagem (edge function nova)

**`supabase/functions/virtual-tryon/index.ts`**

- Recebe `{ userImageUrl: string, outfitImageUrl: string }`.
- Chama Lovable AI Gateway com modelo **`google/gemini-2.5-flash-image`** (Nano Banana — rápido e econômico).
- Payload: mensagem multimodal com **as duas imagens** + prompt em português (fixado no servidor).
- `modalities: ["image", "text"]`.
- Retorna `{ imageBase64: string }` (data URL `image/png`) e também salva o resultado no bucket para URL pública estável.
- CORS padrão, validação com Zod, tratamento explícito de **429** (rate limit) e **402** (créditos esgotados) com mensagens claras para o cliente.

**Prompt usado pela edge function** (fixado no servidor, nunca exposto ao cliente):

```
INPUT: Você recebe DUAS IMAGENS:
- IMAGE A: a pessoa de referência (rosto e identidade)
- IMAGE B: a roupa/look a ser vestido

TASK: Gere UMA imagem ultra realista, proporção vertical 9:16,
estilo fotografia publicitária de estúdio premium, mostrando a pessoa
da IMAGE A vestindo exatamente o look da IMAGE B.

FACE/IDENTIDADE (LOCK TOTAL DA IMAGE A):
- Manter exatamente o rosto, estrutura facial, olhos, nariz, boca
- Manter cor e textura de pele
- Manter cor, comprimento e estilo do cabelo
- Manter expressão natural e idade aparente

CORPO:
- Manter proporções coerentes com a pessoa da IMAGE A
- Pose neutra de catálogo, corpo inteiro centralizado
- Postura ereta, leve contrapposto, mãos relaxadas ao lado do corpo

ROUPA (LOCK TOTAL DA IMAGE B):
- Replicar fielmente a peça/look da IMAGE B (modelo, cor, textura,
  estampas, detalhes, recortes, comprimento)
- NÃO alterar cor, modelo nem amarrações
- Adaptar apenas o caimento ao corpo da pessoa da IMAGE A

CENÁRIO:
- Fundo branco infinito de estúdio (cyclorama branco puro)
- Iluminação de estúdio uniforme, suave, sem sombras duras
- Sombra discreta no chão sob os pés
- Enquadramento vertical 9:16, corpo inteiro, headroom equilibrado

ESTILO:
- Ultra realista, fotografia de moda profissional
- Pele com textura natural
- Foco nítido em rosto e roupa

INTEGRAÇÃO:
- Transição perfeita entre rosto e corpo
- Ajustar pescoço, iluminação e tom de pele para parecer uma única pessoa
- Sem colagem artificial, sem costuras visíveis

NEGATIVE:
- não misturar rostos de outras pessoas
- não alterar a roupa da IMAGE B
- não usar roupas da IMAGE A
- evitar distorções anatômicas, mãos/dedos extras
- evitar artefatos, baixa qualidade, aparência de montagem
- evitar texto, marca d'água, logos não presentes nas imagens originais
```

---

### Storage

- Novo bucket público **`provador`** dedicado (facilita políticas e limpeza futura).
- **Migration**: cria bucket + policies em `storage.objects` (INSERT/SELECT) por `auth.uid()` filtradas por `bucket_id = 'provador'`.
- Path: `provador/{user_id}/{timestamp}-{slot}.jpg` com `slot ∈ {user, outfit, result}`.
- Resultado também salvo no bucket (a partir do base64) para download/compartilhamento via URL pública estável.

### Sem tabela de histórico nesta v1
- Não criamos `tryon_generations` agora — escopo curto. Pode entrar em v2 se virar feature pedida.

---

### Acesso e gating

- Rota privada (mesma proteção das outras internas).
- **Sem paywall na v1** — feature de entretenimento, ajuda em ativação.
- Adicionar entrada no menu inferior "+" (`bottom-plus-menu`) como ação "Provador" com ícone `Shirt` (lucide).

### iOS / monetização
- Rota web pura, sem SKU RevenueCat, sem Stripe — não toca em pagamentos.

---

### Arquivos novos
- `src/pages/Provador.tsx`
- `src/components/provador/TryOnUpload.tsx` (slot de upload reutilizável)
- `supabase/functions/virtual-tryon/index.ts`
- `supabase/migrations/{timestamp}_provador_bucket.sql`

### Arquivos editados
- `src/App.tsx` — registrar rota `/provador` (lazy import, dentro do gate de auth).
- Componente do menu "+" (a confirmar nome em leitura) — adicionar item "Provador".

### Memória a salvar (após build)
- `mem://features/provador/core` — fluxo, modelo `google/gemini-2.5-flash-image`, prompt no servidor, bucket `provador`, formato 9:16.

---

### Fora do escopo (v1)
- Histórico/galeria de looks gerados.
- Edição/refino interativo ("mudar cor", "trocar fundo").
- Geração em lote.
- Watermark "We Diet" na imagem.
- Paywall específico.

---

### Observações
- **Modelo**: `google/gemini-2.5-flash-image` (Nano Banana) — rápido e barato. Qualidade facial pode variar; o aviso legal cobre expectativa.
- **Conteúdo sensível**: gateway tem filtros próprios; aviso de consentimento de terceiros importante por LGPD.

