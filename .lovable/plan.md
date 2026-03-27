

## Subir o modal do chat para perto do topo

### Mudança
**`src/pages/NutriCoach.tsx`** (linha 244):

Trocar o posicionamento de `!top-auto !bottom-24` para `!top-20 !bottom-auto`, e reduzir a altura para `h-[55dvh]` para garantir que mesmo com o modal no topo, ele não se estenda até a área do teclado.

Classes atualizadas:
```
!fixed !inset-x-4 !top-20 !bottom-auto !left-4 !right-4 !w-auto !max-w-lg !mx-auto !translate-x-0 !translate-y-0 h-[55dvh] max-h-[55dvh] rounded-2xl ...
```

### Resultado
- Modal fica ancorado no topo da tela (abaixo da navbar)
- Altura de 55dvh deixa bastante espaço livre embaixo para o teclado
- Teclado abre sem encostar no modal

