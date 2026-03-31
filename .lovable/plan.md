
Resposta curta

Sim: dá para saber com bastante segurança, e hoje já temos dois sinais fortes de que o plugin pode expor mais do que o básico.

O que já sabemos no seu projeto
- Seu app usa `@capgo/capacitor-health` na versão `8.4.2`.
- No código atual, `queryWorkouts()` é chamado em `src/hooks/useHealthKit.ts`.
- Depois disso, o app reduz manualmente o retorno para só 5 campos:
  - `sourceName`
  - `value`
  - `startDate`
  - `endDate`
  - `unit`
- Ou seja: mesmo que o plugin devolva mais dados, a sua camada atual descarta o resto.

Como saber se o plugin realmente suporta campos extras

1) Pela documentação/tipagem do plugin
- A busca na documentação do `@capgo/capacitor-health` já indica que `queryWorkouts()` retorna mais do que só esses campos básicos.
- Nos trechos encontrados, aparecem referências a campos como:
  - `sourceName`
  - `sourceId`
  - `workoutType`
- Isso já mostra que o retorno potencial do plugin é mais rico do que o que seu app está usando hoje.

2) Pelo payload bruto no device real
- A forma mais confiável é olhar o resultado cru de:
  - `Health.queryWorkouts(...)`
- No seu hook já existe este log:
  - `console.log('[HealthKit] queryWorkouts raw result:', JSON.stringify(result));`
- Se nesse log aparecerem campos extras, pronto: o plugin está expondo esses dados para o app.
- Se não aparecerem, então o limite está no plugin ou no tipo de treino/origem gravado no Apple Health.

3) Pela origem do treino
- Mesmo com plugin suportando mais campos, nem todo treino terá tudo.
- Depende de:
  - qual app gravou o treino (Strava, Garmin, Apple Watch etc.)
  - quais permissões foram concedidas
  - quais dados aquele app realmente salvou no Apple Health

Conclusão prática
- Hoje não dá para concluir só olhando a UI, porque a UI está simplificando os dados.
- Mas já dá para dizer que:
  - o plugin provavelmente suporta pelo menos alguns campos extras;
  - a confirmação final vem do retorno bruto de `queryWorkouts()` no iPhone real.

Regra simples
- Se o campo aparece no `raw result`, dá para mostrar no modal.
- Se não aparece no `raw result`, não adianta a UI tentar inventar esse detalhe.

Melhor próximo passo técnico
- Validar o payload bruto de 2 ou 3 treinos reais de apps diferentes.
- Mapear os campos realmente disponíveis.
- Só depois definir o layout do modal com fallback para campos ausentes.

Se você quiser, o próximo plano pode ser exatamente este:
- preservar todos os campos retornados por `queryWorkouts()`,
- tornar o card clicável,
- e abrir um modal com os detalhes reais disponíveis de cada atividade.
