## Mover botões "Sou Lojista / Sou Entregador" para abaixo do card header

### Mudanças em `src/pages/mercado-facil/Index.tsx`

1. **Remover** a `<section>` atual (linhas 244–261) que fica no final, dentro do bloco `else`.
2. **Inserir** uma nova `<section>` logo após o card header (depois da linha 113, antes do card de busca na linha 115), assim os botões aparecem em ambos estados (com ou sem filtro).
3. **Reduzir o tamanho** dos botões: layout horizontal compacto em vez de coluna.
   - Container: `grid grid-cols-2 gap-2`
   - Cada Link: `rounded-2xl px-3 py-2 flex items-center gap-2`
   - Ícone: `size={16}`
   - Label: `text-sm` (sem subtítulo)
   - Remover o `<span>` de descrição (xs) — fica só ícone + nome
4. **Estilo mantido**: primeiro continua `bg-[#FD46A1] text-white`, segundo `bg-white border border-[#FD46A1] text-[#FD46A1]`.

### Fora de escopo
- Sem novos textos ou rotas.
- Não mexer no card header, busca, categorias ou listas.