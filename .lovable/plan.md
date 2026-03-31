
Objetivo
- Criar uma nova experiência de **Hidratação** inspirada nos screenshots: card de progresso, card de gráfico semanal de calorias por bebidas e lista de bebidas consumidas com quantidade/caloria/horário.
- Regra de impacto por bebida: **tabela fixa no app** (base 100 ml).
- Meta diária: **por usuário**.

Plano de implementação

1) Estrutura de dados (Supabase)
- Criar tabela `hydration_records` com:
  - `id`, `user_id`, `beverage_key`, `beverage_name`, `volume_ml`, `calories`, `hydration_factor`, `hydration_impact_ml`, `consumed_at`, `consumption_date`, `created_at`.
- Adicionar em `profiles` a coluna `hydration_goal_ml` (default 3000), para meta individual.
- Aplicar RLS em `hydration_records` (select/insert/update/delete somente `auth.uid() = user_id`).
- Reaproveitar `profiles` já existente para leitura/atualização da meta do usuário.

2) Catálogo fixo de bebidas (frontend)
- Criar constante local (ex.: `src/data/hydrationCatalog.ts`) com itens como:
  - Água (+100), Água com gás (+95), Água de coco (+80), Chá (+90), Refrigerante (-50), Cerveja (-120), Rum (-300), etc.
- Cada item terá: `key`, `name`, `icon`, `hydrationFactor`, `defaultCaloriesPer100ml`, `defaultVolumeOptions`.
- Sem edição pelo usuário nesta fase (tabela fixa).

3) Nova página e rota
- Criar página `src/pages/Hydration.tsx`.
- Adicionar rota no `App.tsx` (ex.: `/hidratacao`).
- Incluir entrada em “Mais” (`tubelight-navbar`) para acesso rápido.

4) Layout da página (ordem solicitada)
- Header no padrão do app (glass + ícone).
- Card 1: **Hidratação**
  - percentual atual, ml hidratantes no dia, objetivo do usuário, barra de progresso.
- Card 2: **Calorias de bebidas (semana)**
  - barras verticais por dia da semana;
  - número de calorias abaixo de cada dia;
  - total de volume consumido no lado direito/esquerdo do card.
- Card 3: **Bebidas consumidas**
  - lista com cards horizontais;
  - nome da bebida;
  - abaixo: quantidade (ml) + calorias;
  - canto direito: horário do consumo.

5) Interação de registro (estilo referência)
- Botão fixo inferior “+ Adicionar bebida”.
- Abrir sheet/modal com:
  - seleção rápida de bebida (chips/cards horizontais),
  - ajuste de volume,
  - confirmação de registro.
- Ao salvar, inserir em `hydration_records` e atualizar cards em tempo real.

6) Regras de cálculo
- Base: 100 ml.
- Fórmula por registro: `hydration_impact_ml = volume_ml * (hydration_factor / 100)`.
  - Ex.: Água 300 ml, fator 100 => +300 ml.
  - Ex.: Rum 100 ml, fator -300 => -300 ml.
- Progresso diário:
  - numerador = soma `hydration_impact_ml` do dia;
  - denominador = `hydration_goal_ml` do usuário;
  - barra com clamp visual 0–100% (valor real pode ser exibido separadamente se exceder/ficar negativo).
- Gráfico semanal:
  - soma de `calories` por `consumption_date` (últimos 7 dias).

7) Consistência visual/mobile
- Manter padrão dos cards do app: `#FFD1E7`, `rounded-3xl`, `shadow-xl`.
- Ajustar espaçamento para viewport 390x640 (sem colisão com navbar inferior e safe areas).
- Tipografia e cores alinhadas à identidade atual (rosa principal `#FD46A1` e acentos aqua dos screenshots).

8) Validação
- Testar fluxo completo:
  - abrir página, cadastrar bebida, ver progresso subir/descer conforme fator;
  - validar gráfico semanal e lista com horário;
  - atualizar meta por usuário e confirmar recálculo imediato;
  - checar comportamento mobile 390x640 end-to-end.
