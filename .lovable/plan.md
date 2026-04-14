

## Remover degradês dos botões do AIGoalsWizard

Trocar todos os `bg-gradient-to-r from-primary to-accent` e `bg-gradient-to-br from-primary to-accent` dos **botões** por `bg-[#FD46A1] hover:bg-[#e03d8f]` no arquivo `src/components/AIGoalsWizard.tsx`.

### Botões afetados (4 botões):
1. **Linha 183** — "Começar ✨"
2. **Linha 566** — "Aplicar Metas"
3. **Linha 622** — "Calcular"
4. Os ícones decorativos (linhas 176, 526, 537) são divs, não botões — manter como estão

### Alteração
Em cada botão, substituir:
- `bg-gradient-to-r from-primary to-accent` → `bg-[#FD46A1] hover:bg-[#e03d8f]`

