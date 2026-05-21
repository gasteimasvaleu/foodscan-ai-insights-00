## Problema

A análise por código de barras está quebrada porque a edge function `open-food-facts` lança erro 500 no início de toda requisição:

```
TypeError: userClient.auth.getClaims is not a function
  at enforceFoodscanQuota (open-food-facts/index.ts:40)
```

O método `auth.getClaims()` não existe na versão do `@supabase/supabase-js@2.45.0` importada na função. Como `enforceFoodscanQuota` é chamado no início do handler, nenhuma análise (iOS ou web) consegue concluir.

## Correção

Substituir `userClient.auth.getClaims(token)` por `userClient.auth.getUser(token)`, que é o método estável e disponível na versão usada — mesmo padrão que outras edge functions do projeto usam para validar o JWT.

### Mudanças em `supabase/functions/open-food-facts/index.ts` (linhas 40–50)

- Trocar:
  ```ts
  const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
  if (claimsError || !claimsData?.claims?.sub) { ... }
  const userId = claimsData.claims.sub as string;
  ```
  por:
  ```ts
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData?.user?.id) { ... }
  const userId = userData.user.id;
  ```

Nenhuma outra alteração necessária — o resto da quota e a chamada ao OpenFoodFacts continuam iguais.

## Validação

1. Após o deploy, testar leitura de um código de barras válido (ex.: 7891000100103) no `/foodscan` web → deve retornar dados nutricionais.
2. Conferir `edge function logs` de `open-food-facts` para garantir ausência do `TypeError`.
