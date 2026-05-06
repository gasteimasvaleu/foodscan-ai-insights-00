## Causa real do erro atual

Após corrigir o `getClaims`, a `analyze-nutrition` voltou a rodar mas agora falha no parse do JSON da OpenAI. Logs mostram:

```
Error parsing JSON: SyntaxError: Unexpected non-whitespace character after JSON at position 1545
Failed to parse nutrition analysis result
```

A OpenAI (`gpt-4.1-2025-04-14`) está devolvendo o objeto JSON correto, **seguido de texto explicativo**:
```
{ ... "nutrition": {...} }

Explicação dos cálculos:
- Os valores totais...
```

O parser atual só remove fences ```` ```json ```` e chama `JSON.parse` direto — quebra com o texto extra.

Esse bug é independente da feature de quota free; só ficou visível agora que o erro anterior (`getClaims`) foi resolvido.

## Correção em `supabase/functions/analyze-nutrition/index.ts`

No `fetch` da segunda chamada OpenAI (análise nutricional, ~linha 235):

1. **Forçar JSON puro**: adicionar no body
   ```ts
   response_format: { type: "json_object" }
   ```
   E reforçar no prompt/system: "responda APENAS o JSON, sem texto extra".

2. **Parser tolerante (fallback)** no bloco ~255–269: se o `JSON.parse` direto falhar, extrair o trecho entre o primeiro `{` e o `}` correspondente (varredura com contador de chaves, respeitando strings) antes de tentar parsear de novo.

Nada mais muda — quota, descrição de imagem e resposta seguem iguais.

## Verificação

1. Reenviar uma foto pelo FoodScan no preview.
2. Conferir nos Edge Function logs que não aparece mais `Failed to parse nutrition analysis result` e que a UI exibe `foodName` + nutrição normalmente.
