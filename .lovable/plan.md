# Remover ícones dos títulos de cards na /maternidade

Padrão do app (memória Core): títulos de card devem ser `text-base`, peso normal e **sem ícones decorativos**. As abas de Gestação já seguem isso. As 5 telas de **Pós-parto** ainda têm ícones nos títulos — todos serão removidos.

## Arquivos e ocorrências

- `src/components/maternidade/posparto/OverviewSection.tsx` — remover ícones de: `whatIs` (Heart), `spectrum` (Brain), `message` (Heart).
- `src/components/maternidade/posparto/SymptomsSection.tsx` — remover ícones de: "Como você está hoje?" (ClipboardCheck), categorias mapeadas (Heart/Activity/Users/Brain), Sinais de alerta (AlertTriangle), Últimos 7 dias (History), Timeline (Clock).
- `src/components/maternidade/posparto/WhenToSeekHelp.tsx` — remover ícones de: `signs` (AlertTriangle), `firstVisit` (HelpCircle), `family` (Users).
- `src/components/maternidade/posparto/ResourcesSection.tsx` — remover ícones de: `emergency` (Phone), `online` (ExternalLink), `apps` (Smartphone), `books` (BookOpen), `forPartners` (Users).
- `src/components/maternidade/posparto/SelfAssessment.tsx` — remover ícones do título intro (ClipboardCheck), Histórico (History) e do título do resultado (CheckCircle/AlertCircle/AlertTriangle).

Em cada caso:
- Tirar o `<Icon />` de dentro do `<CardTitle>`.
- Manter o `flex items-center justify-between` apenas onde há conteúdo à direita (ex.: badge de contagem); nos demais, deixar título simples.
- Manter cores especiais (ex.: `text-red-700` em sinais de alerta) e o `text-base`.
- Remover imports de ícones não mais usados (somente os que deixarem de ser referenciados em outras partes do componente).

## Fora do escopo

- Não mexer em ícones dentro do **conteúdo** dos cards (chips, listas, banners de alerta, botões, items da timeline).
- Não alterar o banner de emergência CVV 188 do `PospartoPanel`.
- Não mudar layout, espaçamento ou cores além da remoção dos ícones.
