## Objetivo

Na seção "Em andamento" do entregador, mostrar visualmente o progresso da entrega (Aceita → Coletada → Entregue) com uma barra de etapas, no estilo "stepper", em vez de só um chip com o status atual.

## Onde

`src/pages/mercado-facil/EntregadorEntregas.tsx` — dentro de cada card da lista `ativas` (linhas ~49–91).

Os status possíveis para uma entrega ativa são `aceita`, `coletada`, `entregue` (definidos em `entregador-types.ts`).

## Plano

1. **Novo componente** `src/components/mercado-facil/MFEntregaProgress.tsx`:
   - Props: `status: "aceita" | "coletada" | "entregue"`.
   - Renderiza 3 etapas: **Aceita**, **Coletada**, **Entregue**.
   - Cada etapa = bolinha numerada + label curto abaixo, conectadas por uma trilha (track) cinza + faixa preenchida em `#FD46A1`.
   - Estado por etapa:
     - **Concluída**: bolinha sólida `#FD46A1` com ícone de check.
     - **Atual**: bolinha sólida `#FD46A1` com leve `animate-pulse` (e a faixa preenchida termina nela com um shimmer/`animate-pulse` sutil para passar o feel de "loading").
     - **Pendente**: bolinha branca com borda `#FD46A1/30`, número em cinza.
   - Largura 100%, padding interno só vertical, sem fundo (encaixa dentro do card).
   - Acessibilidade: `role="progressbar"`, `aria-valuemin=1`, `aria-valuemax=3`, `aria-valuenow` conforme status, `aria-label="Progresso da entrega"`.

2. **Integração no card** (`EntregadorEntregas.tsx`):
   - Manter o preço no canto direito.
   - **Remover o chip de status** (o `<span>` com `ENTREGA_STATUS_LABEL[e.status]`) — a informação passa a vir do stepper, evitando ruído.
   - Inserir `<MFEntregaProgress status={e.status} />` logo abaixo da linha de preço/endereço e acima dos botões de WhatsApp.
   - Manter os botões "Marcar como coletada" / "Marcar como entregue" como ações principais.

3. **Sem mudanças** em hooks, tipos, banco ou no fluxo do cliente — é puramente visual/presentacional.

## Detalhes de estilo (We Diet)

- Cores: trilha `bg-[#FFD1E7]`, preenchimento `bg-[#FD46A1]`, texto ativo `text-[#FD46A1]`, pendente `text-foreground/40`.
- Tipografia: `text-base` no h3 mantido; labels do stepper `text-[11px]` para caber confortável em 390px.
- Animação: `transition-all duration-500 ease-out` na largura da faixa preenchida; `animate-pulse` apenas na bolinha atual.
- Sem ícones decorativos no h3, conforme padrão do projeto.

## Fora de escopo

- Card de "Disponíveis para aceitar" (sem progresso, é só aceitar).
- Telas do cliente / dashboard do entregador.
- Persistência ou mudança nos timestamps `aceita_em`/`coletada_em`/`entregue_em`.