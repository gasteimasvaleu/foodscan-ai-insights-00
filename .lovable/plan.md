# Resolver impasse do entregador: loja decide quem aciona

## Decisão
A loja define no cadastro **quem aciona o entregador**:
- **"Eu (loja) aciono"** (padrão) — cliente não vê lista de entregadores no Carrinho; loja resolve no painel.
- **"Cliente aciona"** — cliente vê lista no Carrinho e chama direto; loja não vê o modal "Entregador do app" (mas continua podendo registrar entrega própria).

## Banco

### Migração: nova coluna em `mf_lojas`
```sql
ALTER TABLE public.mf_lojas
  ADD COLUMN IF NOT EXISTS quem_aciona_entregador text NOT NULL DEFAULT 'loja'
  CHECK (quem_aciona_entregador IN ('loja','cliente'));
```

`aceita_entregador` continua existindo e significa "esta loja trabalha com entregador do app" (false = só entrega própria/retirada). O novo campo só é relevante quando `aceita_entregador = true`.

## Frontend

### `src/pages/mercado-facil/LojistaConfigLoja.tsx`
Dentro da seção "Entrega", quando `aceitaEntregador` estiver ligado, mostrar um **radio/segmented** abaixo da taxa:
- **Eu (loja) chamo o entregador** (default)
- **Cliente chama o entregador no carrinho**

Texto de apoio explicando que isso muda quem vê a lista. Persistir como `quem_aciona_entregador` no save.

### `src/pages/mercado-facil/Carrinho.tsx`
Renderizar `<MFEntregadoresDisponiveis>` **somente quando** `loja.aceita_entregador === true && loja.quem_aciona_entregador === 'cliente'`. Caso contrário, esconder a lista e mostrar um aviso curto: *"A loja se encarregará da entrega."*

### `src/pages/mercado-facil/LojistaPedidos.tsx`
No modal "Acionar entrega":
- Se `loja.quem_aciona_entregador === 'cliente'`, **desabilitar** o botão "Entregador do app" (já desabilita quando `aceita_entregador=false`) e forçar `modoEntrega='propria'`, com nota: *"O entregador foi chamado pelo cliente; use 'Entrega própria' para registrar status."*
- Se `loja.quem_aciona_entregador === 'loja'`, fluxo atual (app ou própria, à escolha).

### `src/lib/mercado-facil/types.ts`
Adicionar `quem_aciona_entregador: 'loja' | 'cliente'` em `MFLoja`.

## Fora de escopo
- Não unifica `mf_entregas` com a "chamada" do cliente (cliente continua só abrindo WhatsApp do entregador, sem criar registro).
- Não muda RLS nem a função `mf_entregadores_disponiveis`.

## Após implementação
Lojista escolhe o modelo uma vez no cadastro; o impasse some — só um lado vê a opção de acionar.
