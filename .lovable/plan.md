

## Padronizar cor (#FFD1E7) e border-radius (rounded-3xl) em todos os cards do app

### Padrao de referencia (DailyGoals)
- Background: `bg-[#FFD1E7]`
- Border radius: `rounded-3xl`
- Demais: `backdrop-blur-sm shadow-xl border border-white/20`

### Alteracoes necessarias

**1. ExerciseForm.tsx** (linha 118)
- Remover: `bg-[#FFD1E7] backdrop-blur-lg border-white/20 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 hover:shadow-2xl hover:shadow-gray-300/60 dark:hover:shadow-gray-800/60 transition-all duration-500 hover:scale-[1.01] animate-scale-in`
- Remover div overlay gradiente (linha 120): `bg-gradient-to-r from-blue-500/5 to-pink-500/5`
- Aplicar: `bg-[#FFD1E7] backdrop-blur-sm rounded-3xl border-white/20 shadow-xl border border-white/20`

**2. ExerciseHistory.tsx** (linhas 93, 121, 142)
- Trocar `bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-white/20 shadow-xl` por `bg-[#FFD1E7] backdrop-blur-sm rounded-3xl shadow-xl border border-white/20`
- Remover divs overlay gradiente nas linhas 123, 144

**3. ExerciseDashboard.tsx** (linhas 111, 123, 141, 159, 177)
- Loading cards (111): adicionar `bg-[#FFD1E7] rounded-3xl`
- 4 stat cards (123, 141, 159, 177): trocar gradientes coloridos por `bg-[#FFD1E7] backdrop-blur-sm rounded-3xl shadow-xl border border-white/20`, remover hover:scale e overlay divs

**4. FoodNutritionResults.tsx** (linha 153)
- Trocar `bg-white/90` por `bg-[#FFD1E7]`

**5. NutritionResults.tsx** (linha 105)
- Trocar `bg-white/90` por `bg-[#FFD1E7]`

**6. LoadingState.tsx** (linha 7)
- Trocar `bg-white/90` por `bg-[#FFD1E7]`

**7. OpenFoodFactsLoadingState.tsx** (linha 6)
- Trocar `bg-white/90` por `bg-[#FFD1E7]`

**8. TruthMoment.tsx** (linhas 37, 49)
- Trocar `bg-white/90` por `bg-[#FFD1E7]`

**9. FoodScan.tsx** (linha 688)
- Trocar `bg-white/90` por `bg-[#FFD1E7]`

**10. MasterCheFIT.tsx** (linha 360)
- Trocar `bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg...` por `bg-[#FFD1E7] backdrop-blur-sm rounded-3xl shadow-xl border border-white/20`

**11. ServiNUTRI.tsx** (linha 499)
- Trocar `bg-gradient-to-r from-green-50 to-blue-50 border-green-200` por `bg-[#FFD1E7] backdrop-blur-sm rounded-3xl shadow-xl border border-white/20`

**12. Subscription.tsx** (linhas 25, 88, 109)
- Trocar `bg-white/90 backdrop-blur-sm shadow-xl border border-white/20` por `bg-[#FFD1E7] backdrop-blur-sm rounded-3xl shadow-xl border border-white/20`

**13. SubscriptionStatus.tsx** (linhas 24, 34)
- Trocar `bg-white/90` por `bg-[#FFD1E7] rounded-3xl`

**14. SubscriptionRequired.tsx** (linha 24)
- Trocar `bg-white/90` por `bg-[#FFD1E7] rounded-3xl`

**15. SubscriptionPlans.tsx** (linha 186)
- Trocar `bg-white/90` por `bg-[#FFD1E7]`

**16. Auth.tsx** (linha 273)
- Trocar `bg-white/90` por `bg-[#FFD1E7] rounded-3xl`

**17. AuthCard.tsx** (linhas 73, 85, 95, 108)
- Trocar `bg-white/90` por `bg-[#FFD1E7] rounded-3xl`

**18. WelcomeMessage.tsx** (linha 10)
- Trocar `bg-white/90` por `bg-[#FFD1E7]`, trocar `rounded-2xl` por `rounded-3xl`

**19. WeeklySummary.tsx** (linhas 156, 171)
- Ja tem `bg-[#FFD1E7]`, adicionar `rounded-3xl`

**20. HowItWorksCard.tsx** (linha 7)
- Trocar `bg-white/90` por `bg-[#FFD1E7] rounded-3xl`

**21. PaymentCancel.tsx** (linha 27)
- Trocar `bg-white/90` por `bg-[#FFD1E7] rounded-3xl`

**22. PaymentSuccess.tsx** (linha 50)
- Trocar `bg-white/90` por `bg-[#FFD1E7] rounded-3xl`

### Resumo
- ~22 arquivos alterados
- Todas as variacoes de background (`bg-white/80`, `bg-white/90`, gradientes coloridos) serao substituidas por `bg-[#FFD1E7]`
- Todos os border-radius serao padronizados para `rounded-3xl`
- Efeitos hover excessivos (scale, shadow changes) e overlays gradiente serao removidos dos cards

