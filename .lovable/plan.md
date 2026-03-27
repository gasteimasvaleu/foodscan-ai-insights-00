

## Reduzir fonte do nome no perfil

### Mudança

**`src/pages/Profile.tsx` (linha 198)** — Reduzir o tamanho da fonte do nome de `text-3xl` para `text-xl` e adicionar `truncate` para garantir que caiba em uma linha.

```tsx
// De:
<CardTitle className="text-3xl mb-2">{profile?.name}</CardTitle>

// Para:
<CardTitle className="text-xl mb-2 truncate">{profile?.name}</CardTitle>
```

