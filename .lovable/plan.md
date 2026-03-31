
Objetivo
- Completar a seção **“Escolha a bebida”** com as bebidas dos screenshots, mantendo o layout atual e adicionando **scroll interno** nessa área para suportar lista grande no mobile.

Escopo confirmado
- Calorias: **Estimativa padrão** (kcal por 100 ml).
- Conflitos de percentual com bebidas já existentes: **manter valores atuais do app**.
- Alterar apenas o necessário em:
  - `src/data/hydrationCatalog.ts`
  - `src/pages/Hydration.tsx`

Plano de implementação

1) Expandir catálogo fixo de bebidas
- Adicionar no `hydrationCatalog` as bebidas faltantes vistas nos screenshots (ex.: garrafa de água, chás específicos, cafés, leites e versões vegetais, isotônico, kombucha, vinhos e destilados, etc.).
- Para cada nova bebida, preencher:
  - `key` único e estável
  - `name`
  - `hydrationFactor` conforme screenshot (para novas bebidas)
  - `defaultCaloriesPer100ml` por pesquisa nutricional média (estimativa padrão)
  - `defaultVolumeOptions` coerente com tipo da bebida
  - `icon`
- Manter intactas as bebidas já existentes mesmo quando houver divergência no screenshot (regra aprovada).

2) Pesquisa e padronização de calorias
- Usar valores médios por 100 ml de referências nutricionais públicas e consistentes.
- Aplicar arredondamento simples para manter previsibilidade no cálculo do app.
- Em bebidas de alta variabilidade, usar valor médio conservador (sem bloquear inclusão da bebida).

3) Scroll interno na seção “Escolha a bebida”
- Manter o mesmo grid visual atual (2 colunas mobile / 3 no sm).
- Envolver a grade em container com altura máxima e rolagem vertical:
  - exemplo de estratégia: `max-h-[38vh] overflow-y-auto pr-1`.
- Preservar aparência atual (chips/cards iguais), mudando apenas comportamento de overflow.

4) Compatibilidade com o modal atual
- Não alterar estrutura principal do dialog (estilo já aprovado).
- Garantir que, com a lista longa, o restante do modal continue acessível:
  - seleção de quantidade
  - prévia
  - botão salvar
- Evitar “duplo problema de rolagem” ajustando limites para o scroll interno da lista + scroll geral do modal.

5) Validação funcional (mobile-first 390x640)
- Conferir no `/hidratacao`:
  - novas bebidas aparecem em “Escolha a bebida”;
  - lista rola suavemente dentro da seção;
  - seleção da bebida atualiza opções de volume;
  - cálculo de calorias/impacto na prévia segue funcionando;
  - layout geral permanece igual ao que você aprovou.

Detalhes técnicos
- Fórmulas existentes serão preservadas:
  - `hydration_impact_ml = volume_ml * (hydrationFactor / 100)`
  - `calories = round((volume_ml / 100) * defaultCaloriesPer100ml)`
- Nenhuma mudança de banco ou migração necessária.
- Mudança 100% client-side e retrocompatível com registros já salvos.
