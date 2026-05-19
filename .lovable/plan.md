## Padronizar header de `/to-aqui/owner/venue/new`

Alinhar a página `ToAquiNewVenue.tsx` ao padrão visual do app (mesmo header usado em `ToAqui.tsx`).

### Mudanças em `src/pages/ToAquiNewVenue.tsx`

1. **Background**: trocar `bg-[#F7FAFB]` por `bg-background` (token semântico já usado em Tô Aqui).

2. **Header card padrão** (substituir o bloco atual de back + título nas linhas 107–117):
   - Wrapper `animate-fade-in`.
   - Card `bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3`.
   - Ícone à esquerda em quadradinho `bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg` com `Store` (ou `MapPin`) branco.
   - Título `Novo venue` com `text-lg font-bold text-primary`.
   - Botão **voltar** alinhado à direita via `ml-auto`: `Button variant="ghost" size="icon"` com `ArrowLeft`, classes `text-primary hover:bg-white/40 rounded-full`, `onClick={() => navigate(-1)}`, `aria-label="Voltar"`.

3. Importar o ícone novo (`Store`) de `lucide-react` se for usado no lugar do MapPin.

Nenhuma outra alteração no formulário.
