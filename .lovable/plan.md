## Objetivo

Capturar e exibir o **Estado (UF)** do cliente no fluxo do Mercado Fácil, do Carrinho até o card de acionar entrega — visível tanto no modo "Entregador do app" quanto "Entrega própria".

## 1. DB (migration)

Adicionar colunas opcionais:

```sql
ALTER TABLE public.mf_order_log ADD COLUMN cliente_estado text;
ALTER TABLE public.mf_entregas  ADD COLUMN estado text;
```

Nulos para registros antigos. Sem mudanças em RLS.

## 2. `src/lib/mercado-facil/whatsapp.ts`

- `SendArgs`: adicionar `estado?: string`.
- `DeliveryRequestArgs`: adicionar `estado?: string`.
- `sendOrderToWhatsApp`: gravar `cliente_estado: args.estado?.trim() || null`.
- `sendDeliveryRequestToWhatsApp`: gravar `estado: estado ?? null` no insert de `mf_entregas`. Incluir `— UF` na linha do endereço da mensagem.

## 3. `src/pages/mercado-facil/Carrinho.tsx`

- Novo `estado` state, persistido junto com cidade/endereco no `ADDRESS_KEY` (localStorage).
- Pré-preencher com `profile.state` quando vazio.
- Input compacto ao lado de Cidade (grid 2 col) com maxLength 2, uppercase.
- Passar `estado` para `sendOrderToWhatsApp` e para `MFEntregadoresDisponiveis` (se necessário, em prop futura — fora de escopo agora).

## 4. `src/pages/mercado-facil/LojistaPedidos.tsx`

- Adicionar `cliente_estado: string | null` em `OrderLog`.
- Novo state `estadoEntrega`.
- No `onClick` do botão "Entrega" (linha ~239), pré-preencher: `setEstadoEntrega(p.cliente_estado ?? loja.endereco?.estado ?? "")` (campo `estado` do endereço da loja não existe hoje no tipo — usar só `p.cliente_estado ?? ""`).
- No dialog (linha ~412), trocar o `div` único de Cidade por um `grid grid-cols-[1fr_80px] gap-2` com Cidade + Estado (UF, maxLength 2, uppercase). Aparece em **ambos** os modos pois fica na seção compartilhada.
- `criarEntrega`: incluir `estado: estadoEntrega.trim().toUpperCase() || null` no insert de `mf_entregas`.
- Passar `estado` quando chamar `MFEntregadoresDisponiveis` via prop futura (apenas se já aceitar — verificar; senão, fora de escopo).

## 5. Card do pedido (linha ~200)

Exibir UF junto da cidade no header do card, se presente:
- Logo abaixo do nome do cliente, adicionar `{p.cliente_cidade && <p className="text-xs text-foreground/60">{p.cliente_cidade}{p.cliente_estado ? ` - ${p.cliente_estado}` : ""}</p>}`.

## Fora de escopo

- CEP, bairro estruturado.
- Validação de UF contra lista fixa (apenas uppercase + maxLength 2).
- Atualização de `MFEntregadoresDisponiveis` para usar `estado` no filtro (segue usando cidade).
