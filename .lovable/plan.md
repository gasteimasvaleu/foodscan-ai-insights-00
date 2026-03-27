

## Corrigir título colado na navbar do NutriCoach

### Problema
A navbar tem `h-12` (48px) + safe-area. O conteúdo do NutriCoach usa `pt-[calc(env(safe-area-inset-top)+2.5rem)]` = 40px no browser (sem safe-area), ficando 8px atrás da navbar. Outras páginas como DailyControl funcionam porque têm um container interno com `py-8` que adiciona espaço extra.

### Correção
**`src/pages/NutriCoach.tsx`** — linha 217:

Aumentar o padding-top de `2.5rem` para `4rem` (64px), garantindo folga suficiente abaixo da navbar:

```
pt-[calc(env(safe-area-inset-top)+4rem)]
```

Isso é consistente com o que a página de Política de Privacidade usa (`+4rem`) e garante que o card título fique visivelmente abaixo da navbar em qualquer device.

### Resultado
- Card título fica com espaço correto abaixo da navbar
- Sem mudança no chat modal (que já foi ajustado antes)
- Sem impacto em outras páginas

