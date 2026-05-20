## Ajustar fundo do LoadingOverlay

Trocar o fundo escuro do `VideoOverlay` por **branco com fumacê rosa nas bordas** (vinheta radial rosa por cima de base branca).

### Mudança

Em `src/components/VideoOverlay.tsx`, substituir a classe atual:
```
bg-gradient-to-br from-[#1a0a14]/95 via-[#FA1690]/30 to-[#1a0a14]/95 backdrop-blur-xl
```

Por base branca + vinheta rosa via `radial-gradient` inline (Tailwind não cobre radial nativo):
- Base: `bg-white/95 backdrop-blur-xl`
- Vinheta nas bordas: `style={{ backgroundImage: 'radial-gradient(ellipse at center, transparent 35%, rgba(253,70,161,0.18) 75%, rgba(253,70,161,0.35) 100%)' }}`

Resultado: centro branco limpo (spinner rosa em destaque), bordas com névoa rosa suave que escurece levemente até as quinas.

### Ajuste de contraste do texto

Com fundo branco, o `text-white` do `message` fica ilegível. Trocar:
- `message`: `text-white drop-shadow-lg` → `text-[#FD46A1]` (sem drop-shadow)
- `subMessage`: `text-white/80 drop-shadow` → `text-foreground/60`

### Arquivos
- **Editar** `src/components/VideoOverlay.tsx` (só o `className`/`style` do container e cor dos textos)

### Fora de escopo
- Spinner, animações, e API do componente — mantidos.
- Nenhuma outra tela tocada.
