

## Plan: Standardize "Estatísticas Gerais" inner cards styling

The inner stat cards (lines 503-524) use `text-3xl` for values, varied gradient backgrounds (`from-primary/10`, `from-orange-500/10`, etc.), and different icon colors. These need to match the app's established pattern.

### Changes in `src/pages/Profile.tsx` (lines 494-526)

1. **Card wrapper**: Change from `bg-card/80` to `bg-[#FFD1E7] rounded-3xl border-white/20`
2. **Inner stat cards**: Change gradient backgrounds to `bg-[#F9FAFB] rounded-2xl`
3. **Value text**: Change `text-3xl font-bold text-foreground` to `text-2xl font-bold text-[#FD46A1]`
4. **Icons**: All icons change to `text-pink-500`
5. **Subtitle text**: Keep `text-sm text-muted-foreground` (already consistent)
6. **CardTitle**: Remove the `User` icon, center the title text to match other card headers

