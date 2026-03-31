
Resposta curta: não, ele está próximo, mas não está exatamente no mesmo padrão visual principal dos outros modais do app.

O que comparei
- Modal atual em `src/pages/AppleHealth.tsx`:
  - `w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-background/95 shadow-xl backdrop-blur-md`
- Padrão mais recorrente no app e na memória de UI:
  - `w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl`

Conclusão
- Mantém alguns elementos do padrão:
  - largura mobile-friendly
  - `max-w-md`
  - `rounded-2xl`
  - `backdrop-blur-md`
  - `shadow-xl`
- Mas foge do padrão principal em 3 pontos:
  1. usa `bg-background/95` em vez de `bg-white/70`
  2. usa `border border-border` em vez de `border-2 border-primary`
  3. os cards internos também seguem um visual mais neutro (`border-border bg-muted/40`) em vez da estética glassmorphism/primary mais comum

Comparação com outros modais
- `MyDiets.tsx`, `ChartsProgress.tsx`, `Profile.tsx`, `RecentScans.tsx`, `VideoModal.tsx` usam exatamente ou quase exatamente o padrão glassmorphism
- `Hydration.tsx` também está bem próximo do padrão
- `AddExerciseModal.tsx` já foge um pouco, então hoje existe uma pequena inconsistência entre modais no projeto

Leitura prática
- Se a sua pergunta for “ele está funcional e coerente?”:
  - sim
- Se a pergunta for “ele está no mesmo padrão visual predominante do app?”:
  - não totalmente

Ajuste recomendado, se quiser padronizar
- Trocar o `DialogContent` do Apple Health para o padrão:
  - `w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl`
- Opcionalmente alinhar os blocos internos para combinar melhor com os outros modais

Detalhe técnico
- A estrutura base do componente `Dialog` é a mesma do app inteiro, então a diferença está mais na estilização passada via `className` do `DialogContent` do que no componente de modal em si.
