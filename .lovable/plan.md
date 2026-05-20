Refinar `src/components/ui/accordion.tsx` (componente global) com duas melhorias visuais. Afeta automaticamente FAQ, ExamsSection, WeekByWeekContent, e qualquer outro lugar que use o Accordion shadcn/Radix.

## Mudanças

**1. Chevron rosa em pílula + easing suave**
- Substituir o `ChevronDown` cinza (h-4 w-4) por um círculo de 28px com `bg-[#FD46A1]/10` e o chevron `text-[#FD46A1]` (h-4 w-4) dentro.
- Quando aberto (`data-state=open`), o círculo vira `bg-[#FD46A1]` e o chevron `text-white`.
- Rotação 180° ao abrir, com `transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]` (Apple-like).
- Mantém o `transition-transform` que já existe para a rotação.

**2. Fade-in do conteúdo ao abrir**
- O `AccordionContent` hoje só anima altura (`accordion-down/up`).
- Envolver o `children` interno em um `<div>` com `data-[state=open]:animate-fade-in` lendo o `data-state` do parent via group, OU simplesmente aplicar `animate-fade-in` no `<div className="pb-4 pt-0">` interno — só anima na montagem do conteúdo aberto, dá fade + slide-up de 10px que já existe no `tailwind.config`.
- Zero JS, zero dep nova.

## Fora de escopo
- Não muda nenhum consumidor (FAQSection, ExamsSection, etc.) — eles continuam passando as mesmas props.
- Não mexe em cores de fundo dos cards (FFD1E7, white/60), padding, radius, ou tipografia.
- Não toca em `Collapsible` (componente diferente).

## Risco
Baixo. Mudança puramente visual em um único arquivo (`src/components/ui/accordion.tsx`, ~50 linhas). Sem migração de API.
