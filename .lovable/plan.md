## Ajuste fino — navbar inferior

Aumentar levemente o espaçamento (meio caminho entre o valor antigo e o atual).

### Alterações em `src/components/ui/tubelight-navbar.tsx`

1. **Container externo (linha 110)**: `gap-0.5 sm:gap-2` → `gap-1 sm:gap-2`; padding `px-1.5 sm:px-2` → `px-2 sm:px-2.5`.
2. **Wrapper dos itens (linha 131)**: `gap-0.5 sm:gap-2` → `gap-1 sm:gap-2`.
3. **Botões/links (linhas 142 e 160)**: `px-2 sm:px-3` → `px-2.5 sm:px-3`.

Mantém `min-h-[44px]` / `min-w-[44px]`. Sem mudanças de lógica.