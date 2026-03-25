

## Padronizar cores do Histórico de Cardápios com o card Preferências Alimentares

### Alterações em `src/pages/MasterCheFIT.tsx`

1. **Card container do histórico** (linha 489): trocar `bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-primary/10` por `bg-[#FFD1E7] rounded-3xl shadow-xl border border-white/20`

2. **Cards individuais de cada cardápio** (linha 500): trocar `bg-gradient-to-br from-primary/10 to-primary/15 hover:bg-gradient-to-br hover:from-primary/20 hover:to-primary/25` por `bg-[#F9FAFB]`

3. **Textos dentro dos cards individuais**:
   - Título h3 (linha 505): `text-white/95` → `text-gray-800`
   - Texto "Total:" (linha 508): `text-white/80` → `text-gray-600`
   - Título do CardTitle (linha 491): sem alteração necessária (já usa cor padrão)

