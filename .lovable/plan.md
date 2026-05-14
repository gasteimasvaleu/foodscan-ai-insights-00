## Diagnóstico

Olhando o código:
- `PostCard.tsx` linha 187: o botão de comentar simplesmente faz `setShowComments(!showComments)` — não tem nenhuma checagem que limite a apenas o autor.
- RLS de `post_comments` permite qualquer usuário autenticado ler e inserir o próprio comentário (verificado via SQL).
- `CommentSection` renderiza o input para qualquer usuário logado.

Tecnicamente, o botão **deveria** funcionar para todos. Pelo session replay, o usuário está clicando no canto direito do card (x≈388, viewport 390px), onde ficam os ícones de **3 pontinhos (MoreHorizontal)** e **Enviar DM (Send)** — não no ícone de comentar, que fica à esquerda (Heart, MessageCircle, Send, em sequência com `gap-3 px-3`).

Hipótese mais provável: a barra de ações (Heart / MessageCircle / Send) está **fora do viewport visível** quando o post tem imagem grande (até 600px), empurrando os botões para baixo da dobra. O usuário então clica nos únicos ícones visíveis (no header do card) achando que são "comentar".

## Plano

1. **Reproduzir no preview** com `browser--navigate_to_sandbox` em `/comunidade`, logado como um usuário que não é o autor de nenhum post, e verificar:
   - Se a barra de ações realmente fica abaixo da dobra
   - Se o clique no `MessageCircle` abre `CommentSection` normalmente
   - Se há algum erro de JS no console

2. **Correções prováveis** em `src/components/community/PostCard.tsx`:
   - Reduzir `max-h-[600px]` da imagem para algo como `max-h-[420px]` ou `aspect-square` para garantir que os ícones de ação fiquem visíveis no viewport mobile.
   - Garantir que o ícone de comentar tenha área de toque maior (`p-1` no botão) e contraste melhor.

3. Se a hipótese estiver errada e o problema for outro (ex: erro de RLS específico, click bloqueado), ajustar conforme o que for descoberto na reprodução.

## Pergunta de confirmação

Antes de implementar, gostaria de confirmar com você: ao tocar no ícone de **balão de fala (segundo ícone, abaixo da imagem do post)**, nada acontece? Ou você está tocando nos **3 pontinhos (canto superior direito)** esperando que abrisse comentários?