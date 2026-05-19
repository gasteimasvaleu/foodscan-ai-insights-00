## Objetivo

Alinhar `/nutricionista-que-vende` ao padrão visual do app (mesmo padrão de MasterCheFIT, Comunidade, etc.): mostrar a Navbar, usar o background gradiente do app e colocar o título dentro do card-header padrão.

## Mudanças em `src/pages/NutricionistaQueVende.tsx`

1. **Importar e renderizar a Navbar**
   - Adicionar `import { Navbar } from "@/components/Navbar";`
   - Envolver o retorno em `<>...</>` e renderizar `<Navbar />` antes do container.

2. **Background e safe-area no padrão do app**
   - Trocar `bg-[#F7FAFB]` por `bg-gradient-primary`.
   - Ajustar o padding-top para `pt-[calc(env(safe-area-inset-top)+2.5rem)]` (mesmo valor das demais páginas internas).
   - Manter `pb-28` e `px-4`.

3. **Header dentro de card (mesmo padrão MasterCheFIT)**
   - Substituir o `<header>` atual por um bloco com:
     - Container `bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3`
     - Ícone (ex.: `Sparkles` ou `Megaphone` do lucide-react) em caixinha `bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg` com `text-white`.
     - `<h1 className="text-xl font-bold text-[#FD46A1]">Nutricionista que Vende</h1>`
   - Mover a frase descritiva ("Gere posts profissionais...") para fora do card como `<p className="text-sm text-muted-foreground px-1">` logo abaixo, ou removê-la se ficar redundante.

4. **TabsList**
   - Manter como está (já segue padrão rosa do app).

Nenhuma mudança em lógica, geração de imagem/legenda, hooks ou edge functions. Apenas layout/shell da página.

## Validação visual

- Confirmar no preview mobile (390px) que a Navbar aparece no topo, o background é o gradiente rosa padrão e o título "Nutricionista que Vende" está dentro do card-header com ícone, igual às outras páginas internas.
