

## Trocar input de texto "Quais tipos de dieta?" por seletor multi-opção

### Problema
No iOS nativo, o `<Input>` de texto livre na linha 489 do `AIGoalsWizard.tsx` (step 10 — histórico de dietas) abre o teclado nativo e empurra o conteúdo do Drawer para cima, quebrando o layout.

### Solução
Substituir o input de texto por um grid de `SelectCard` clicáveis (mesmo padrão já usado em outros steps do wizard, como sexo, restrições, etc.) com seleção múltipla. O valor final em `data.dietTypes` continua sendo uma `string` (itens separados por vírgula) para manter compatibilidade com a edge function `ai-goals-calculator` — nenhum ajuste no backend necessário.

### Mudanças em `src/components/AIGoalsWizard.tsx`

**Adicionar constante de opções** (próximo aos outros arrays de opções no topo do componente):
```ts
const DIET_TYPE_OPTIONS = [
  { value: 'low_carb', label: 'Low Carb', icon: '🥑' },
  { value: 'cetogenica', label: 'Cetogênica', icon: '🥓' },
  { value: 'jejum_intermitente', label: 'Jejum Intermitente', icon: '⏱️' },
  { value: 'mediterranea', label: 'Mediterrânea', icon: '🫒' },
  { value: 'vegetariana', label: 'Vegetariana', icon: '🥦' },
  { value: 'vegana', label: 'Vegana', icon: '🌱' },
  { value: 'paleo', label: 'Paleo', icon: '🍖' },
  { value: 'contagem_calorias', label: 'Contagem de Calorias', icon: '🔢' },
  { value: 'shakes', label: 'Shakes/Substitutos', icon: '🥤' },
  { value: 'outra', label: 'Outra', icon: '✨' },
];
```

**Substituir o bloco do input (linhas 487-490)** por um grid de cards com toggle de seleção múltipla:
```tsx
<div className="space-y-2">
  <Label>Quais tipos de dieta? (selecione todas que já fez)</Label>
  <div className="grid grid-cols-2 gap-3">
    {DIET_TYPE_OPTIONS.map(opt => {
      const selectedSet = new Set(
        data.dietTypes ? data.dietTypes.split(',').map(s => s.trim()).filter(Boolean) : []
      );
      const isSelected = selectedSet.has(opt.label);
      return (
        <SelectCard
          key={opt.value}
          selected={isSelected}
          onClick={() => {
            const next = new Set(selectedSet);
            if (isSelected) next.delete(opt.label);
            else next.add(opt.label);
            setData(d => ({ ...d, dietTypes: Array.from(next).join(', ') }));
          }}
        >
          <div className="text-center py-2">
            <div className="text-2xl mb-1">{opt.icon}</div>
            <span className="text-sm font-semibold text-gray-800">{opt.label}</span>
          </div>
        </SelectCard>
      );
    })}
  </div>
</div>
```

### Resultado
- Sem nenhum input de texto neste step → teclado nativo do iOS não abre mais → Drawer não é deslocado.
- `data.dietTypes` continua sendo string (ex.: `"Low Carb, Jejum Intermitente"`), mantendo o payload enviado à edge function exatamente igual.

