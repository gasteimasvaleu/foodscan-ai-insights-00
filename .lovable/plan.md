

## Card de Avaliação Física no carrossel da home

Adicionar um 4º slide ao carrossel do `AuthCard` mostrando dados da última avaliação física — **só aparece se o usuário tiver pelo menos uma avaliação registrada**.

### Comportamento
- Busca a avaliação mais recente em `physical_assessments` (ordenada por `assessment_date desc`, limit 1).
- Se **não existir** nenhuma avaliação: o slide simplesmente não entra no carrossel (mantém calorie + hydration + fasting + banners).
- Se **existir**: vira o 4º card de resumo, com mesmo padrão visual dos outros (gradiente, anéis/destaques, CTA inferior).
- Se houver pelo menos 2 avaliações, calcula a **variação de peso** vs. a anterior (Δ kg + seta ↑/↓).
- Click no card → navega para `/profile/assessment`.

### Novo componente
**`src/components/DailyAssessmentSummaryCard.tsx`** (espelha o padrão do `DailyHydrationSummaryCard`):
- Gradiente: `from-violet-500 via-purple-500 to-fuchsia-500` (diferenciar dos outros 3).
- Título: **"Avaliação Física"** (mesma tipografia uppercase tracking-wider).
- Layout central:
  - Coluna esquerda: **Peso** atual em destaque (`{weight} kg`) + label "peso atual".
  - Centro: anel SVG com **% Gordura Corporal** (mesmo padrão do anel de hidratação, ícone `Activity` ou `Scale` da lucide no centro).
  - Coluna direita: **IMC** calculado de `weight / (height/100)²` arredondado a 1 casa + label "IMC".
- Linha inferior: badge com variação vs. avaliação anterior (`▼ 1.2 kg` em verde se diminuiu / `▲` em vermelho se aumentou / "estável" se igual). Omitida quando só há 1 avaliação.
- CTA: **"Ver Avaliações"** com `ChevronRight`.
- Estado `loading` idêntico ao Hydration card.
- Estado "sem dados" → componente retorna `null` (não renderiza).

### Integração no `AuthCard.tsx`
1. Novo estado `hasAssessment: boolean | null` (null = ainda carregando, evita "piscar" o slide).
2. Buscar `physical_assessments` (count) no mesmo `useEffect` do `profile` (já dependente de `user.id`).
3. `extraSummaries = 3 + (hasAssessment ? 1 : 0)` substituindo o `+3` fixo em `totalSlides` e nas condições de visibilidade.
4. Renderizar bloco `<DailyAssessmentSummaryCard />` como 4º slide (índice `bannerImages.length + 3`), apenas quando `hasAssessment === true`.
5. O autoplay e o swipe touch continuam funcionando (já usam `totalSlides` derivado).

### Sem mudanças de banco
Tabela `physical_assessments` já existe com RLS por `user_id`. Nenhuma migration.

### Arquivos afetados
- **Novo**: `src/components/DailyAssessmentSummaryCard.tsx`
- **Editado**: `src/components/AuthCard.tsx` — fetch + novo slide condicional + recálculo de `totalSlides`.

### Fora do escopo
- Mostrar fotos antes/depois no card (espaço insuficiente — fica para a página dedicada).
- Edição/criação de avaliação a partir do card.

