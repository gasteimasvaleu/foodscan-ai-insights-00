
# Usar a mesma IA do FoodScan no WhatsApp

## Problema Atual

O WhatsApp usa um fluxo inferior para análise de imagens:
- Chama `analyze-image` (GPT-4o) com um prompt simples
- Tenta extrair calorias/proteínas/carboidratos/gorduras via **regex** do texto livre
- Se o formato do texto mudar, os valores caem no fallback (500 kcal, 25g prot, etc.)

O FoodScan usa `analyze-nutrition` com um fluxo de duas etapas:
- **Etapa 1**: GPT-4o analisa a imagem com prompt detalhado (descrição rica)
- **Etapa 2**: GPT-4.1 recebe a descrição e retorna **JSON estruturado** com nutrição precisa

## Solucao

Alterar `whatsapp-process-image` para chamar `analyze-nutrition` (passando `base64Image`) em vez de `analyze-image`. A funcao `analyze-nutrition` ja aceita `base64Image` e faz todo o trabalho em duas etapas.

## Mudancas Necessarias

### 1. `supabase/functions/whatsapp-process-image/index.ts`

**Trocar a chamada de funcao** (1 linha):
- De: `supabase.functions.invoke('analyze-image', { body: { base64Image } })`
- Para: `supabase.functions.invoke('analyze-nutrition', { body: { base64Image } })`

**Ajustar a validacao do retorno**:
- De: `analysisData?.description`
- Para: `analysisData?.foodName` (o formato de retorno do `analyze-nutrition` e diferente)

**Simplificar a extracao de nutricao** — em vez de regex, usar os valores estruturados do JSON:
```text
calories = analysisData.nutrition.calories
proteins = analysisData.nutrition.proteins
carbs    = analysisData.nutrition.carbohydrates
fats     = analysisData.nutrition.fats
```

**Ajustar a montagem da mensagem**:
- Usar `analysisData.description` para o texto descritivo (ja vem do analyze-nutrition)
- Usar `analysisData.foodName` para o nome do alimento
- Usar `analysisData.elements` (se existir) para listar itens individuais
- Remover toda a logica de regex de extracao de nutricao (linhas ~100-130)

**Ajustar os dados do pending_meal**:
- Usar `analysisData.foodName` como nome
- Usar os valores numericos diretos do JSON

### 2. Nenhuma outra funcao precisa ser alterada

A `analyze-nutrition` ja esta pronta e funcional. Nenhuma mudanca necessaria nela.

## Beneficios

- Analise de imagem identica ao FoodScan (mesma qualidade)
- Valores nutricionais em JSON estruturado (sem regex fragil)
- Sem fallbacks incorretos (500 kcal generico)
- Se a analise do FoodScan melhorar no futuro, o WhatsApp melhora junto
- Usa GPT-4.1 para a analise nutricional (modelo mais recente)

## Riscos

- **Baixo**: a chamada `analyze-nutrition` e ligeiramente mais lenta por fazer duas chamadas de IA em vez de uma. Mas a qualidade compensa.
- **Nenhum risco de quebra**: a funcao `analyze-nutrition` ja e usada em producao pelo FoodScan.

## Detalhes Tecnicos

A resposta do `analyze-nutrition` tem este formato:
```text
{
  "foodName": "Nome do prato",
  "description": "Descricao detalhada...",
  "quantity": "Porcao tipica",
  "elements": [...],        // opcional, se multiplos itens
  "nutrition": {
    "calories": 450,
    "carbohydrates": 55,
    "proteins": 35,
    "fats": 8,
    "fiber": 5,
    "sodium": 300
  }
}
```

A mensagem do WhatsApp sera montada usando esses campos diretamente, eliminando toda a logica de regex.
