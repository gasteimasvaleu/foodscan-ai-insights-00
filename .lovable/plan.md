

## Alterar cores dos cards QuickActions

Trocar os gradientes Tailwind por cores sólidas alternando entre `#E24989` e `#FA1690`.

Ordem (último card = WhatsApp = na frente):
1. Escanear Comida → `#FA1690`
2. Registrar Exercício → `#E24989`
3. Gerar Cardápio → `#FA1690`
4. WhatsApp → `#E24989`

### Alteração em `src/components/QuickActions.tsx`

- Substituir a propriedade `gradient` por `color` com o hex correspondente
- No botão, trocar `className` com `bg-gradient-to-r ${action.gradient}` por `style={{ backgroundColor: action.color }}` inline

