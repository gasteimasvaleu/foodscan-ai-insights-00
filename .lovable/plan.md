
## Página de Maternidade no We Diet

Criar uma seção `/maternidade` no We Diet trazendo todo o conteúdo e ferramentas do app **sleep-wise-helper** (Mamãe Dormiu), preservando a UX (estrutura por abas, ferramentas interativas, conteúdo semana a semana) mas adaptando 100% ao design system We Diet (primary `#FD46A1`, cards `#FFD1E7`, glassmorphism em modais, tipografia padrão, page header rosa, free para usuárias logadas).

Tradução: **só PT** (o app original é trilíngue PT/EN/ES, mas o We Diet é PT-BR — ignoramos os outros idiomas).

---

### Estrutura de rotas

```text
/maternidade              → Hub com 4 abas grandes
   ├─ Tentantes           (aba "tentantes")
   ├─ Gestação            (aba "gestacao")
   ├─ Pós-parto           (aba "posparto")
   └─ Bebê & Sono         (aba "bebe")
```

Hub único com `<Tabs>` no topo, cada aba renderiza seu próprio bloco com sub-tabs internas (igual ao padrão do app original). Acesso livre para qualquer usuária logada (sem `ProRoute`).

**Sem entrada nova** em QuickActions, SecondaryDeckRow ou HeroDeckRow. Acesso será adicionado depois — por enquanto a rota `/maternidade` fica disponível para acesso direto/teste.

---

### Conteúdo a portar (do sleep-wise-helper)

**1. Gestação** (`src/components/gestacao/*`)
- `WeekByWeekContent` — guia semana a semana (1 a 40), com mudanças no bebê e na mãe
- `DueDateCalculator` — calculadora de DPP
- `KickCounter` — contador de chutes (sessão de 1h)
- `WeightTracker` — acompanhamento de ganho de peso
- `PregnancyDiary` — diário emocional
- `BabyChecklist` — enxoval/checklist do bebê
- `ExamsSection` — exames por trimestre
- `SymptomsSection` — sintomas e quando procurar ajuda
- Conteúdo: `src/data/pregnancy-content.json` (apenas chave `pt`)

**2. Pós-parto** (`src/components/posparto/*`)
- `OverviewSection` — visão geral saúde mental pós-parto
- `SymptomsSection` — baby blues, depressão pós-parto, ansiedade, psicose
- `SelfAssessment` — questionário Edinburgh (EPDS)
- `WhenToSeekHelp` — sinais de alerta
- `ResourcesSection` — contatos de apoio (CVV 188, etc.)
- Banner de emergência fixo
- Conteúdo: `src/data/postpartum-content.json` (apenas chave `pt`)

**3. Bebê & Sono** (`src/components/tools/*` + `src/data/content.json`)
- `WakeWindowCalculator` — janelas de vigília por idade
- `RoutineGenerator` — gerador de rotina personalizada
- `SleepDiary` — diário de sono
- Resumo das 50 dicas (versão condensada do `content.json`, navegável por categoria)

**4. Tentantes** (novo — não existe no app original)
- Card com dicas de nutrição pré-concepcional (folato, ferro, B12)
- Calculadora simples de janela fértil (data da última menstruação + duração do ciclo)
- Checklist pré-concepcional (exames, suplementação, hábitos)
- Conteúdo escrito direto em PT, sem JSON externo

---

### Adaptação ao design system We Diet

| Elemento original (sleep-wise-helper) | Adaptação no We Diet |
|---|---|
| `bg-gradient-to-b from-pink-50/50 to-background` | `bg-[#F7FAFB]` com gradiente sutil |
| Header com emoji grande + `text-3xl font-bold` | Page header horizontal compacto, título `text-[#FD46A1]`, sem emoji decorativo |
| Cards genéricos `Card` | `bg-[#FFD1E7] rounded-3xl`, título `text-base` sem ícone decorativo |
| Tabs com `bg-muted/50` | Tabs com fundo glassmorphism (`bg-white/70 backdrop-blur-md`) |
| Modais/Dialogs default | Glassmorphism + botão de fechar com `bg-[#FD46A1]` |
| Inputs de formulário | `text-base` mínimo (anti-zoom iOS); wheel pickers para datas/números quando aplicável |
| Padding top | `pt-[calc(env(safe-area-inset-top)+4rem)]` |
| Padding bottom | `pb-28` (espaço pra TubelightNavbar) |

Header: criar `MaternidadeHeader.tsx` seguindo o padrão dos outros page headers do We Diet.

---

### Persistência de dados

Mesma estratégia do app original — **localStorage** namespaced por feature. Sem mexer no Supabase nesta entrega:

```text
wediet:mat:gestacao:dpp
wediet:mat:gestacao:kicks         (array de sessões)
wediet:mat:gestacao:peso          (array de pesagens)
wediet:mat:gestacao:diario        (array de entradas)
wediet:mat:gestacao:enxoval       (objeto de itens marcados)
wediet:mat:posparto:epds          (resultado do último teste)
wediet:mat:bebe:rotina            (rotina gerada)
wediet:mat:bebe:diario_sono       (array de noites)
```

Migração futura para Supabase fica fora do escopo — pode virar fase 2 quando confirmar que vale a pena.

---

### Detalhes técnicos

**Arquivos a criar no We Diet:**
```text
src/pages/Maternidade.tsx                          (hub + tabs principais)
src/components/maternidade/
  ├─ MaternidadeHeader.tsx
  ├─ tentantes/
  │   ├─ TentantesPanel.tsx
  │   ├─ FertileWindowCalculator.tsx
  │   └─ PreConceptionChecklist.tsx
  ├─ gestacao/
  │   ├─ GestacaoPanel.tsx                         (sub-tabs)
  │   ├─ DueDateCalculator.tsx
  │   ├─ KickCounter.tsx
  │   ├─ WeightTracker.tsx
  │   ├─ PregnancyDiary.tsx
  │   ├─ BabyChecklist.tsx
  │   ├─ WeekByWeekContent.tsx
  │   ├─ ExamsSection.tsx
  │   └─ SymptomsSection.tsx
  ├─ posparto/
  │   ├─ PospartoPanel.tsx                         (sub-tabs)
  │   ├─ OverviewSection.tsx
  │   ├─ SymptomsSection.tsx
  │   ├─ SelfAssessment.tsx
  │   ├─ WhenToSeekHelp.tsx
  │   └─ ResourcesSection.tsx
  └─ bebe/
      ├─ BebePanel.tsx                             (sub-tabs)
      ├─ WakeWindowCalculator.tsx
      ├─ RoutineGenerator.tsx
      ├─ SleepDiary.tsx
      └─ TipsBrowser.tsx
src/data/maternidade/
  ├─ pregnancy-pt.json                             (extraído do JSON original, só chave pt)
  ├─ postpartum-pt.json                            (idem)
  └─ baby-tips-pt.json                             (idem, do content.json)
```

**Modificações:**
- `src/App.tsx` → registrar `<Route path="/maternidade" element={<Maternidade />} />`

**Removido / não portado do app original:**
- Landing page comercial (Hotmart checkout, depoimentos, vídeo)
- Sistema de idiomas (PT/EN/ES) — só PT
- Login/Auth próprio — usa o `useAuth` do We Diet
- `BabyGenerator`, `BabyNames`, `Community`, `BabaDigital`
- Painel admin do app original
- PWA install prompt

---

### Faseamento sugerido

Pra não virar uma entrega gigante, dividir em fases:

1. **Fase 1 (esta entrega):** Hub `/maternidade` + aba **Gestação** completa (8 ferramentas + conteúdo semana a semana)
2. **Fase 2:** Aba **Pós-parto** completa (5 seções + EPDS + banner emergência)
3. **Fase 3:** Aba **Bebê & Sono** (3 ferramentas + 50 dicas)
4. **Fase 4:** Aba **Tentantes** (calculadora fértil + checklist + dicas nutricionais)

Confirma a Fase 1 pra eu começar? Ou prefere outra ordem (ex.: começar pela Bebê & Sono que é o "core" do app original, ou já entregar tudo numa só)?
