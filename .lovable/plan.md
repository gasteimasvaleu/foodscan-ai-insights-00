

## Corrigir página Objetivos para seguir o padrão visual

### Problemas identificados
1. **Padding superior**: falta `pt-[calc(env(safe-area-inset-top)+4rem)]`
2. **Card de título**: usa `bg-[#FFD1E7] rounded-3xl` em vez do padrão `bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl`
3. **Ícone**: usa div rosa com ícone colorido em vez do padrão `bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg` com ícone branco `w-6 h-6 text-white`
4. **Subtítulo**: tem subtítulo mas o padrão global removeu subtítulos dos headers

### Alteração em `src/pages/Objetivos.tsx`

- Container principal: trocar `<div className="px-4 py-4 space-y-4">` por `<div className="px-4 pt-[calc(env(safe-area-inset-top)+4rem)] pb-24 space-y-4">`
- Substituir o header card inteiro pelo padrão:
```tsx
<div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
  <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
    <Target className="w-6 h-6 text-white" />
  </div>
  <h1 className="text-lg font-bold text-primary">Meus Objetivos</h1>
</div>
```
- Mover o bloco "Progresso semanal" para fora do header card (como card separado abaixo)
- Remover subtítulo "Gamifique sua alimentação"

