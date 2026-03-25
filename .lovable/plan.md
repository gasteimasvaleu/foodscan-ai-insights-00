

## Adicionar Navbar (barra superior) nas 3 páginas internas do Profile

### Problema
As páginas WorkoutPlan, MyDiets e PhysicalAssessment não importam nem renderizam o componente `<Navbar />` (barra superior rosa com logo e "MEU PERFIL"). Todas as outras páginas do app incluem esse componente.

### Alterações

**1. `src/pages/WorkoutPlan.tsx`**
- Importar `Navbar` de `@/components/Navbar`
- Adicionar `<Navbar />` no início do JSX retornado (antes do div principal)
- Adicionar `pt-20` ao container principal para compensar a navbar fixa

**2. `src/pages/MyDiets.tsx`**
- Importar `Navbar` de `@/components/Navbar`
- Adicionar `<Navbar />` no início do JSX retornado
- Adicionar `pt-20` ao container principal

**3. `src/pages/PhysicalAssessment.tsx`**
- Importar `Navbar` de `@/components/Navbar`
- Adicionar `<Navbar />` no início do JSX retornado
- Adicionar `pt-20` ao container principal

