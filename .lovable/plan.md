
## Corrigir estilo do campo de hora no modal de lembrete (iOS)

### Problema
No iOS nativo, o `<input type="time">` é renderizado como um botão grande centralizado, quebrando o layout visual do modal.

### Solução em `src/components/RemindersCard.tsx`

Aplicar estilos específicos ao Input de hora para forçar aparência consistente no iOS:
- Adicionar `appearance-none` e `text-base` (previne zoom no iOS)
- Adicionar `text-left` para alinhar o texto à esquerda
- Adicionar altura fixa `h-10` para manter consistência com os outros campos

Alterar o Input de hora (linha ~207) de:
```tsx
<Input type="time" value={reminderTime} onChange={...} />
```
Para:
```tsx
<Input type="time" value={reminderTime} onChange={...} 
  className="text-base text-left appearance-none" />
```
