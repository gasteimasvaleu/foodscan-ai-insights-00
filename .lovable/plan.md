## Objetivo

Melhorar a seção "Disponíveis para aceitar" do entregador para dar mais contexto antes de aceitar (sem inventar dados que o banco não tem).

## Dados disponíveis em `MFEntrega`

`endereco_entrega`, `cidade`, `taxa_centavos`, `created_at`, `loja_id` (sem nome da loja no payload), `telefone_lojista`. **Não temos** distância, nome da loja, valor do pedido nem endereço de coleta.

## Plano

Tudo dentro de `src/pages/mercado-facil/EntregadorEntregas.tsx`, sem mudanças de tipos/hooks/DB.

1. **Contador "X disponíveis"** ao lado do título "Disponíveis para aceitar" — pequeno chip rosa com a contagem (`disponiveis.length`).

2. **Card redesenhado**, mantendo `rounded-3xl` e padrões We Diet:
   - **Topo**: badge "Nova" em `#FFD1E7`/`#FD46A1` quando `created_at` for < 2 min, + tempo relativo ("há 3 min") em `text-foreground/60`. À direita, o preço em destaque (`text-lg font-bold #FD46A1`) ou "A combinar" quando 0.
   - **Linha de endereço** com ícone `MapPin` pequeno + endereço em `text-sm`.
   - **Linha de cidade** em `text-xs text-foreground/60`.
   - **Botão "Aceitar entrega"** mantido em largura total, rosa.
   - Pequeno efeito `hover:shadow-md transition-shadow` no card.

3. **Helper local `tempoRelativo(iso)`** — retorna "agora", "há X min", "há X h" (sem dependências novas).

4. **Auto-refresh leve** das disponíveis: a cada 20s chamar `reload()` do hook (já existe `reload` em `useMFEntregas`? confirmar; se não, usar `setInterval` que dispara uma mudança no `cidade` derivada não é viável — então usar o padrão simples de `setInterval` com `window.location` é ruim; melhor expor/reaproveitar `reload`). **Verificação obrigatória antes de implementar:** abrir `useMFEntregas.ts` para confirmar se já existe `reload`. Se existir, adicionar `useEffect` com `setInterval(reload, 20000)` na página. Se não existir, **pular esta etapa** e deixar só uma nota — não é o foco da melhoria UX visual.

5. **Estado vazio** já é razoável; só trocar a copy para algo mais acolhedor: "Nenhuma entrega disponível agora. Assim que aparecer, ela cai aqui." mantendo o mesmo estilo do card vazio.

## Fora de escopo

- Buscar nome da loja, endereço de coleta, distância, ETA (exigiriam mudanças de schema/joins).
- Mexer no card de "Em andamento" (já refinado na rodada anterior).
- Mudar o fluxo de aceitar/recusar.