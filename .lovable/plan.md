## Filtro "Novidades" — últimos 7 dias

Atualizar a lógica do filtro em `src/pages/mercado-facil/Index.tsx` (bloco `useMemo` de `filtered`).

### Mudança

No ramo `quickFilter === "novidades"`: filtrar produtos cujo `created_at` é maior ou igual a hoje menos 7 dias, mantendo a ordenação do mais recente para o mais antigo.

```ts
} else if (quickFilter === "novidades") {
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
  arr = arr
    .filter((p) => p.created_at && new Date(p.created_at) >= seteDiasAtras)
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
}
```

Sem mudanças em backend, schema ou outros filtros.