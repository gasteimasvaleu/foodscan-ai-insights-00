# Melhorias no Paywall (/assinar)

## Diagnóstico

`Paywall.tsx` envelopa `PaywallScreen.tsx`. Ambos têm `min-h-screen` + padding próprio, gerando conflito:
- Paywall.tsx: `pt-[calc(env(safe-area-inset-top)+4rem)] pb-8`
- PaywallScreen.tsx: `min-h-screen flex items-center justify-center p-4`

Resultado: padding superior duplicado, sem padding inferior real, e o `flex items-center` do filho não centraliza dentro do espaço útil porque o pai já consumiu o topo.

## Mudanças

### 1. `src/pages/Paywall.tsx` — wrapper minimalista
- Remover `pt-[…+4rem]` e `pb-8` do container interno.
- Manter o header fixo com botão X (já tem safe-area).
- Trocar wrapper por `min-h-screen flex flex-col` que apenas hospeda o badge contextual + `<PaywallScreen>`.
- Mover o badge contextual (reason/feature) para dentro do espaço scrollável próximo ao card, não mais como bloco isolado no topo.

### 2. `src/components/PaywallScreen.tsx` — centralização e visual

**Layout:**
- Container: `min-h-screen flex items-center justify-center px-4 pt-[calc(env(safe-area-inset-top)+3.5rem)] pb-[calc(env(safe-area-inset-bottom)+7rem)]` (pb cobre Navbar visível para free users + safe area).
- Centraliza vertical e horizontalmente com espaço respirável.

**Visual do card:**
- Trocar fundo sólido `#FFD1E7` por gradiente sutil: `bg-gradient-to-br from-white via-[#FFE9F3] to-[#FFD1E7]`.
- Adicionar glow rosa atrás: wrapper com `before:` pseudo blur `bg-[#FD46A1]/30 blur-3xl`.
- Header mais compacto: logo menor (h-12), badge "PRO" pill com gradiente acima do título.
- Preço em destaque maior (`text-3xl`), com tag "MENSAL" pequena ao lado.
- Adicionar selo "Cancele quando quiser" abaixo do preço.

**Lista de benefícios — ampliada (de 4 para 9 itens, em 2 colunas no card):**
1. FoodScan ilimitado (Salad)
2. NutriCoach com IA (Brain)
3. Cardápio semanal automático (Sparkles)
4. Treinos em vídeo (Dumbbell)
5. Faça em Casa — receitas por foto (ChefHat)
6. Provador Inteligente (Shirt)
7. Apple Health & FitTracker (Activity)
8. Jejum + Sono + Hidratação (Moon)
9. Gráficos de progresso & objetivos (TrendingUp)
10. Lembretes via WhatsApp (MessageCircle)

Layout: grid `grid-cols-2 gap-2` com cards mini (icon + texto curto), destacando "FoodScan ilimitado" full-width como primeiro item (badge "MAIS USADO").

**CTA:**
- Botão maior com gradiente `from-[#FD46A1] to-[#FF6FB5]`, sombra rosa, texto "Começar agora".
- Texto secundário "7 dias para testar com calma" (apenas texto motivacional — sem mexer em trial real).
- Restaurar Compras como botão secundário discreto.

**Termos:** manter, mas reduzir/colapsar visualmente (text-[9px], opacity-70).

## Fora de escopo
- Sem mudanças de preço, plano anual ou trial real (continua mensal RevenueCat).
- Sem mudanças no fluxo de purchase/restore.
- Sem mexer no Paywall iOS-block (`iOS Compliance Flow` permanece intacto).

## Arquivos
- `src/pages/Paywall.tsx`
- `src/components/PaywallScreen.tsx`
