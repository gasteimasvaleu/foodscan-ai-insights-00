

## Correção: WhatsApp card espremido em iPhones menores

### O problema
Em iPhones menores, não há espaço suficiente de scroll na página, então o conteúdo do card WhatsApp (ícone, título, tags) fica preso atrás do menu inferior. Em iPhones maiores sobra espaço natural.

### A solução (simples)
Aumentar **apenas** o padding inferior da página (`pb-20` → `pb-32`) no `Index.tsx`. Isso dá mais espaço de rolagem para o usuário poder "subir" os cards com o dedo.

O visual do último card **não muda** — ele continua colado na faixa branca, com a parte inferior escondida atrás dela. A única diferença é que agora o usuário consegue rolar o suficiente para ver o conteúdo (ícone, título, tags) acima do menu.

### Arquivo alterado

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Index.tsx` | Trocar `pb-20` por `pb-32` no container principal (linha 104) |

Nenhuma mudança no `QuickActions.tsx` — o efeito visual de conexão com a faixa branca permanece idêntico.

