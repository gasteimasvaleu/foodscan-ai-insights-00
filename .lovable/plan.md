## Correção dos modais em /maternidade

Os dois modais da seção Maternidade (`CycleTracker` em Tentantes e `PregnancyDiary` em Gestação) estão usando classes que ocupam toda a largura horizontal e não seguem o padrão visual do app (glassmorphism + borda rosa).

### Padrão oficial do app (usado em `AddObjectiveModal`, `WidgetPromoModal`, etc.)

```
w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl
```

### Arquivos a editar

1. **`src/components/maternidade/tentantes/CycleTracker.tsx`** (linha 186)
   - Trocar `className="bg-white/70 backdrop-blur-md max-h-[85vh] overflow-y-auto"`
   - Por `className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl max-h-[85vh] overflow-y-auto"`

2. **`src/components/maternidade/gestacao/PregnancyDiary.tsx`** (linha 95)
   - Trocar `className="bg-white/70 backdrop-blur-md border-white/60 max-w-md max-h-[85vh] overflow-y-auto"`
   - Por `className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl max-h-[85vh] overflow-y-auto"`

### Fora do escopo

- Nenhuma alteração em conteúdo, lógica de submit ou estilos internos dos modais.
