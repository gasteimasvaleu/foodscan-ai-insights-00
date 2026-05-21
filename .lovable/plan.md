## Objetivo

Permitir que a loja registre e atualize manualmente uma "entrega própria" (motoboy fixo, terceirizado por WhatsApp, retirada no balcão etc.) reutilizando a mesma tabela `mf_entregas` e o mesmo card de acompanhamento que cliente e lojista já veem.

## Estratégia técnica

Reaproveitar `mf_entregas`. Marcar a entrega como "própria" usando `entregador_id IS NULL` + um novo flag para distinguir de uma entrega ainda em busca de motoboy:

- Adicionar coluna `tipo` em `mf_entregas`: `'app' | 'propria'`, default `'app'` (mantém compatibilidade).
- Entrega `tipo = 'propria'` é criada já com `status = 'aceita'` (pula "disponível", não notifica entregadores) e `entregador_id = null`.
- A loja avança o status manualmente: **Aceita → Coletada → Entregue**. Pode também **Cancelar**.

## Migration

```sql
ALTER TABLE public.mf_entregas
  ADD COLUMN tipo text NOT NULL DEFAULT 'app' CHECK (tipo IN ('app','propria'));
```

Atualizar RLS de UPDATE em `mf_entregas`: o lojista dono já pode atualizar suas entregas; verificar policy atual e, se necessário, garantir que `auth.uid() = lojista_id` permita transições de status quando `tipo = 'propria'`.

## Mudanças de código

### 1. `src/lib/mercado-facil/entregador-types.ts`
- Adicionar `tipo: 'app' | 'propria'` ao `MFEntrega`.

### 2. `src/pages/mercado-facil/LojistaPedidos.tsx` — modal "Acionar entregador"
- Toggle no topo do modal (Tabs ou par de pills): **"Entregador do app"** (default) | **"Entrega própria"**.
- Modo "app": fluxo atual (status `disponivel`, notifica entregadores).
- Modo "própria":
  - Campo "Taxa" continua (informativo).
  - Campos "endereço" e "cidade" continuam.
  - Campo "WhatsApp do cliente" continua (loja pode querer contatar).
  - Botão muda para **"Registrar entrega própria"**.
  - Insert com `tipo: 'propria'`, `status: 'aceita'`, `aceita_em: now()`, `entregador_id: null`.

### 3. `src/pages/mercado-facil/LojistaPedidos.tsx` — card do pedido
Quando `entrega.tipo === 'propria'` e status ativo, mostrar abaixo do `MFEntregaProgress` uma linha de ações compactas com botões para o lojista avançar:
- Status `aceita` → botão "Saiu para entrega" (vira `coletada`, seta `coletada_em`).
- Status `coletada` → botão "Marcar entregue" (vira `entregue`, seta `entregue_em`).
- Sempre disponível enquanto ativo: botão secundário "Cancelar".

Reutiliza `marcarColetada`, `marcarEntregue`, `cancelar` que já existem em `useMFEntregas`.

### 4. `src/components/mercado-facil/MFClientePedidosStatus.tsx` (visão do cliente)
- Nenhuma mudança funcional necessária — o cliente já vê o `MFEntregaProgress` igual para qualquer `tipo`.
- Pequeno indicador textual opcional: quando `tipo === 'propria'`, trocar o texto "Buscando entregador…" pelo título "Entrega pela loja" no cabeçalho do bloco (entrega própria nunca fica em `disponivel`, então esse caso já está coberto naturalmente). Adicionar só um badge "Entrega pela loja" para deixar claro ao cliente que não é um entregador do app.

### 5. `src/pages/mercado-facil/EntregadorEntregas.tsx`
- Confirmar que o filtro `scope: "entregador-disponivel"` já ignora entregas `tipo = 'propria'` (não vai aparecer porque elas nunca ficam em status `disponivel`). Sem mudança esperada.

## Fora de escopo
- Sem cadastro de nome/telefone do motoboy externo (escolha confirmada: "só o status").
- Sem link público para o motoboy externo atualizar.
- Sem alteração nas avaliações (`mf_entregador_avaliacoes`) — entrega própria não gera avaliação.

## Arquivos alterados
- `supabase` migration (1 ALTER TABLE)
- `src/lib/mercado-facil/entregador-types.ts`
- `src/pages/mercado-facil/LojistaPedidos.tsx`
- `src/components/mercado-facil/MFClientePedidosStatus.tsx` (badge opcional)
