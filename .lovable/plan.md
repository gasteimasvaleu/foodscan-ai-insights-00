## Objetivo

Alinhar `/to-aqui` ao padrão visual do app (mesmo padrão de `/loja`, `/quiz`, etc.): background neutro `bg-background` e card de cabeçalho em gradiente translúcido com ícone em pill.

## Mudanças em `src/pages/ToAqui.tsx`

1. **Background da página**
   - `bg-[#F7FAFB]` → `bg-background`
   - Container: trocar `pb-28` por `pb-24 space-y-5` (igual `/loja`)

2. **Card header padrão**
   - Substituir o bloco atual (título + subtítulo + botão "Meus venues" em outline) por:
     - Card único: `bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3`
     - Pill de ícone: `bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg` com `<MapPin className="w-6 h-6 text-white" />`
     - Título: `<h1 className="text-lg font-bold text-primary">Tô Aqui</h1>`
     - Botão "Meus venues" como ícone discreto à direita (`ml-auto`), `variant="ghost"` `size="icon"` com `Settings` em `text-primary` — mantém acesso sem poluir o header.
   - Envelopar em `<div className="animate-fade-in">`.

3. **Resto da página**
   - Mantém busca, chips de categoria, lista e empty-state. Sem mudanças funcionais.
   - Trocar cores hex fixas (`#FD46A1`, `#FFD1E7`) por tokens (`primary`, `primary/10`, `primary-foreground`) nos chips e empty-state para coerência total — opcional, mas recomendado.

## Detalhes técnicos
- Não toca em rotas, hooks ou dados.
- Mantém Navbar, paddings de safe-area e `max-w-2xl mx-auto`.
- Sem alterações em backend.
