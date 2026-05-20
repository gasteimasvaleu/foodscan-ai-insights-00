Redesenhar o card de loja em `src/pages/mercado-facil/Index.tsx` (linhas 236-263) com divisão diagonal:

- Card retangular `h-32 rounded-3xl overflow-hidden` com `relative`.
- Imagem da loja ocupando metade esquerda via `clip-path: polygon(0 0, 60% 0, 40% 100%, 0 100%)` (diagonal da direita-cima para esquerda-baixo).
- Lado direito (parte branca) com nome da loja em destaque, descrição truncada e bairro/cidade abaixo, alinhado à direita com padding adequado.
- Fallback 🏪 mantido quando não há `foto_url`.
- Mantém `<Link>` para `/mercado-facil/loja/:id`, hover-shadow, borda `#FD46A1/30`.

Layout aproximado:

```text
┌─────────────┬───────────────┐
│  [imagem]   ╲   Nome Loja   │
│             ╲  descrição    │
│              ╲ bairro·cidade│
└──────────────╲──────────────┘
```

Sem mudanças em dados ou rotas.