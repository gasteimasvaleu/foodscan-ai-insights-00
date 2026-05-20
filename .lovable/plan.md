## Destaque do texto no hero card de /mercado-facil

Envolver o bloco de texto à direita ("Compare Preços e Economize" + subtítulo) em um card interno com efeito visual de destaque, mantendo a imagem `galegacomsacola.png` à esquerda.

### Mudanças em `src/pages/mercado-facil/Index.tsx` (linhas 100–107)

- Trocar o `<div className="min-w-0">` que envolve o `<h2>` e `<p>` por um card interno:
  - Fundo com gradiente suave rosa: `bg-gradient-to-br from-[#FFD1E7] via-white to-[#FFE9F3]`
  - Borda: `border border-[#FD46A1]/40`
  - `rounded-2xl p-3 shadow-sm`
  - `relative overflow-hidden` para suportar o brilho
- Adicionar um brilho animado (shine) por cima usando um `<span>` absoluto com `bg-gradient-to-r from-transparent via-white/60 to-transparent` e `animate-[shine_2.8s_ease-in-out_infinite]`
- Manter `<h2>` em `text-[#FD46A1]` e `<p>` em `text-foreground/70` (leve ajuste de contraste sobre o fundo rosa claro)

### Keyframe `shine`

Adicionar em `tailwind.config.ts` (dentro de `theme.extend.keyframes` e `animation`):

```ts
keyframes: {
  shine: {
    '0%':   { transform: 'translateX(-120%)' },
    '60%':  { transform: 'translateX(120%)' },
    '100%': { transform: 'translateX(120%)' },
  },
},
animation: {
  shine: 'shine 2.8s ease-in-out infinite',
},
```

### Fora de escopo

- Não alterar a imagem, o card externo, o buscador, nem qualquer lógica.
- Sem novos textos ou CTA.