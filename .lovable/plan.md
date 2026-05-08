Atualizar o estado desconectado do card Apple Health em `src/components/HeroDeckRow.tsx`:

- Remover o círculo com ícone `Heart`, título "Apple Health" e subtítulo "Acompanhe seus passos".
- Renderizar a imagem `https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/gpt-image-2-1.png` ocupando o card inteiro (object-cover, absolute inset-0), mantendo o `aspect-[4/5]` e `rounded-3xl`.
- Sobrepor o botão "Conectar" (pill `bg-[#FD46A1] text-white`) na parte inferior central do card, com pequena margem.
- Alterar `onClick` do card (apenas no estado desconectado) para `navigate('/apple-health')` em vez de `/fit-tracker`. Estado conectado continua indo para `/fit-tracker`.
- Remover import `Heart` se ficar sem uso.