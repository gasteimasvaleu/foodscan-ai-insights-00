## Objetivo
Aplicar o mesmo padrão visual rosa (borda + gradiente lateral + glass) já usado em `/profile/diets` e `/physical-assessment` aos cards da página `/profile/workout`.

## Mudanças em `src/pages/WorkoutPlan.tsx`

### 1. Card por dia da semana (linha 198)
De:
```
className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl"
```
Para:
```
className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0]"
```
Adicionar `pl-5` no `CardHeader` para não colidir com a barra lateral.

Manter `CardTitle` em `text-base` normal (sem ícone) e `CardDescription` discreta — alinhado às regras do design system.

### 2. Itens de exercício (linha 209)
De:
```
rounded-xl bg-muted/50 border border-border/30 p-4 space-y-3
```
Para:
```
rounded-xl bg-[#FFD1E7]/30 border border-[#FD46A1]/15 p-4 space-y-3
```

### 3. Badge de grupo muscular (linha 216)
Trocar `variant="secondary"` por classes rosa:
```
className="text-[10px] px-1.5 py-0 bg-[#FFD1E7]/60 text-[#FD46A1] border border-[#FD46A1]/20"
```

### 4. Botão de deletar (linha 231)
Trocar `text-destructive/70 hover:text-destructive` por:
```
text-[#FD46A1]/70 hover:text-[#FD46A1] hover:bg-[#FFD1E7]/40
```

### 5. Bloco de dica de execução (linha 238)
Já usa `bg-primary/5 border-primary/10` (que é #FD46A1). Manter como está — coerente com o tema.

## Fora do escopo
- Sem alteração de tamanho de fonte.
- Sem alteração de lógica, dados, RLS ou backend.
- Sem mexer no header/Navbar da página.
