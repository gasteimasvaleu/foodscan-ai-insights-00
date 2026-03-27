

## Re-deploy da edge function analyze-nutrition

### Situação
O código do prompt já está correto (valores por 100g), mas a edge function pode não ter sido re-deployada após as últimas alterações.

### Correção
**`supabase/functions/analyze-nutrition/index.ts`** — adicionar um comentário de versão no topo do arquivo para forçar o re-deploy automático:

```typescript
// v2.1 - 2026-03-27 - Valores por 100g para múltiplos elementos
```

Isso garante que o Lovable detecte a mudança no arquivo e faça o deploy da edge function com o prompt atualizado.

### Resultado
- Edge function será re-deployada com o prompt que usa 100g por elemento
- Sem mudança funcional no código — apenas trigger de deploy

