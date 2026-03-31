
Objetivo: transformar os campos técnicos (`metadata`, `sourceId`, payload bruto) em informações úteis para o usuário, em vez de exibir JSON cru no modal de `src/pages/AppleHealth.tsx`.

O que está acontecendo hoje
- O modal mostra `metadata` como `JSON.stringify(...)`.
- Também lista “Campos retornados pelo plugin” quase crus.
- Isso é útil para debug, mas ruim para UX: o usuário final não entende JSON e enxerga “lixo técnico”.

Interpretação correta desses campos
- `metadata` não é um campo “bonito” pronto para UI.
- Normalmente ele representa atributos internos do treino, por exemplo:
  - origem do registro
  - tipo técnico do workout
  - identificadores internos
  - dados auxiliares gravados pelo app de origem
- Então o ideal não é “mostrar metadata”, e sim:
  1. extrair significados úteis desses dados
  2. esconder o restante técnico do usuário comum

Plano de ajuste
1. Remover linguagem técnica da UI
- Trocar rótulos como:
  - “Metadata”
  - “Campos retornados pelo plugin”
  - “Source ID”
- Por algo orientado ao usuário, ou ocultar totalmente quando não agregar valor.

2. Criar uma camada de interpretação dos dados
- Em `AppleHealth.tsx`, criar helpers para traduzir chaves técnicas em campos amigáveis.
- Exemplo de saída útil:
  - Aplicativo de origem
  - Tipo de atividade
  - Data e horário
  - Duração
  - Distância
  - Calorias
  - Observações
  - Informações adicionais da atividade

3. Filtrar o que deve aparecer
- Mostrar só dados compreensíveis e relevantes.
- Ocultar:
  - UUIDs
  - URLs internas
  - bundle IDs
  - blobs JSON
  - estruturas técnicas sem significado claro para o usuário

4. Resumir `metadata` em texto amigável
- Em vez de renderizar JSON, converter `metadata` em uma pequena lista de informações legíveis.
- Se não houver nada útil para exibir, simplesmente não mostrar a seção.

5. Manter detalhes técnicos fora da visão principal
- Se quiser preservar debug, colocar em área secundária recolhível, algo como:
  - “Detalhes técnicos”
- Essa seção deve ser opcional e discreta, não parte principal do modal.

Resultado esperado
- O modal fica orientado ao usuário final.
- Some o JSON cru da experiência principal.
- Os dados passam a parecer “detalhes da atividade”, não “resposta da API”.
- O conteúdo continua fiel ao plugin, mas apresentado de forma humana.

Detalhes técnicos
- Arquivo principal: `src/pages/AppleHealth.tsx`
- Ajustes principais:
  - substituir `JSON.stringify(selectedWorkout.metadata, null, 2)` por interpretação amigável
  - filtrar `workoutDetails` para exibir apenas campos úteis
  - remover ou esconder `sourceId` e outras chaves internas da seção principal
- Se necessário, aproveitar `selectedWorkout.metadata` e `selectedWorkout.rawData` apenas como fonte para derivar labels amigáveis, não como conteúdo bruto de UI
