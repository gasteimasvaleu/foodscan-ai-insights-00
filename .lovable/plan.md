## Padronizar página de editar venue

Atualizar `src/pages/ToAquiEditVenue.tsx` para seguir o mesmo padrão visual de `ToAquiOwner.tsx`.

### Mudanças

1. **Background** — trocar `bg-[#F7FAFB]` por `bg-background` (mesmo de `ToAquiOwner`) e também na tela de loading/erro.

2. **Header em card** — substituir o bloco atual:
   ```
   <Button ghost> ArrowLeft </Button>
   <h1>Editar venue</h1>
   ```
   pelo padrão do `ToAquiOwner`:
   - Wrapper `animate-fade-in mb-4`
   - Card com `bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3`
   - Ícone à esquerda: `Pencil` (lucide) em caixinha `bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg` com `text-white`
   - Título `text-lg font-bold text-primary`: "Editar venue"
   - Botão voltar `ArrowLeft` com `ml-auto text-primary hover:bg-white/40 rounded-full` navegando para `/to-aqui/owner`

3. **Borda rosa no card de informações** — no `<form>`, trocar `bg-white rounded-3xl p-5 shadow-sm` por `bg-white rounded-3xl p-5 shadow-sm border border-[#FD46A1]/30` (mesma cor/opacidade já usada em outros cards do Tô Aqui).

Sem alterações de lógica, hooks, upload de foto ou submit.
