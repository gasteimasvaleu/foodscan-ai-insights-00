

# Plano: Corrigir botão "Continuar com Apple" não responsivo no iPhone 17 Pro Max

## Problema

O revisor da Apple reportou que o botão "Continuar com Apple" estava **unresponsive** especificamente no iPhone 17 Pro Max (iOS 26.4). O problema é de layout: o card do fluxo iOS nativo tem muito conteúdo (logo, preço, botão Apple, botão assinar, formulário email/senha, restaurar compras, texto legal, links) e o wrapper usa `min-h-[calc(100vh-env(safe-area-inset-top)-2rem)]` com `flex items-center justify-center`. Em telas com proporções específicas ou com o teclado virtual, o conteúdo do card pode ultrapassar a viewport e ficar cortado/inacessível sem scroll.

## Solução

Tornar o container do fluxo iOS nativo **scrollável** para que todo o conteúdo seja sempre acessível, independentemente do tamanho da tela.

## Alterações

### `src/components/AuthCard.tsx` — wrapper do fluxo iOS nativo (~linha 225)

**De:**
```html
<div className="min-h-[calc(100vh-env(safe-area-inset-top)-2rem)] flex items-center justify-center">
```

**Para:**
```html
<div className="min-h-[calc(100vh-env(safe-area-inset-top)-2rem)] flex items-center justify-center overflow-y-auto">
```

Adicionalmente, adicionar `py-6` ao wrapper para garantir padding vertical adequado e evitar que o conteúdo cole nas bordas em telas menores:

```html
<div className="min-h-[calc(100vh-env(safe-area-inset-top)-2rem)] flex items-center justify-center overflow-y-auto py-6">
```

### Mesma correção no fluxo Web (~linha 310)

Aplicar `overflow-y-auto py-6` também no wrapper do fluxo Web para consistência.

## Resultado

O card será sempre rolável quando o conteúdo exceder a viewport, garantindo que todos os botões (incluindo "Continuar com Apple") sejam sempre acessíveis em qualquer iPhone, incluindo o 17 Pro Max.

