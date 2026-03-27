

## Resolver busca de receitas em português

### Problema
A API do Spoonacular é em inglês — buscar "frango" não retorna resultados, mas "chicken" sim.

### Solução
Usar a OpenAI (já configurada no projeto) para traduzir o termo de busca do português para inglês antes de enviar ao Spoonacular. Também traduzir os títulos dos resultados de volta para português.

### Mudanças

**1. Edge Function `spoonacular-recipes/index.ts`**
- Antes de chamar o Spoonacular, usar a OpenAI para traduzir o `query` de PT-BR → EN
- Após receber os resultados, traduzir os títulos das receitas de EN → PT-BR em batch (uma chamada só)
- Usar o secret `OPENAI_API_KEY` já existente

**2. Detalhes da tradução na action `details`**
- Traduzir título, ingredientes e instruções da receita para PT-BR ao buscar detalhes

### Fluxo
```text
Usuário digita "frango grelhado"
  → Edge Function traduz para "grilled chicken"
    → Spoonacular retorna resultados em inglês
      → Edge Function traduz títulos para PT-BR
        → Frontend exibe em português
```

### Notas técnicas
- A tradução adiciona ~1-2s ao tempo de resposta, mas melhora muito a UX
- Cache não implementado inicialmente (pode ser adicionado depois)
- Usa modelo `gpt-4o-mini` para custo mínimo

