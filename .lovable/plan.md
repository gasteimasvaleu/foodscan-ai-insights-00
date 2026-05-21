# Modal de confirmação de endereço — Carrinho e chamada de entregador

## Objetivo
Antes de qualquer ação que abra o WhatsApp a partir do carrinho (enviar pedido à loja **ou** chamar um entregador), abrir um modal padrão do app para confirmar o endereço de entrega. Modal compacto (não ocupa toda a largura), borda rosa, glassmorphism.

## Arquivos afetados (apenas frontend)

1. `src/components/mercado-facil/MFAddressConfirmDialog.tsx` — **novo** componente reutilizável.
2. `src/pages/mercado-facil/Carrinho.tsx` — usar o modal antes de `handleSend`.
3. `src/components/mercado-facil/MFEntregadoresDisponiveis.tsx` — usar o mesmo modal antes de `handleChamar`.

## Componente novo: `MFAddressConfirmDialog`

Props:
- `open: boolean`
- `onOpenChange: (open: boolean) => void`
- `cidade: string`
- `estado: string`
- `endereco: string`
- `telefone?: string`
- `title?: string` (default "Confirmar endereço de entrega")
- `contextLabel?: string` (ex.: "Loja Padaria do Zé" ou "Entregador João — moto")
- `confirmLabel?: string` (default "Confirmar e enviar")
- `onConfirm: () => void`

Estrutura visual (Dialog do `@/components/ui/dialog`):
- `DialogContent` com `max-w-[340px] w-[calc(100vw-2rem)] rounded-3xl border-2 border-[#FD46A1]/60 bg-white/70 backdrop-blur-md p-5` (não ocupa toda a largura, borda rosa, glassmorphism — padrão `mem://style/ui-modals`).
- Header: título compacto + `contextLabel` em texto secundário.
- Corpo: bloco com `Cidade - UF`, `Endereço` e `Telefone` (cada um em linha, label pequeno + valor; placeholder "—" se vazio).
- Aviso vermelho discreto se algum dos 3 campos obrigatórios (cidade, estado, endereço) estiver vazio.
- Footer (botões empilhados, full-width, gap-2):
  - "Editar endereço" — outline rosa, fecha o modal.
  - `confirmLabel` — bg `#25D366` (verde WhatsApp), `disabled` se algum obrigatório vazio; chama `onConfirm()` e fecha.

## `Carrinho.tsx`
- Novo estado `confirmLojaId: string | null`.
- Botão "Enviar pedido pelo WhatsApp": `onClick={() => setConfirmLojaId(lojaId)}`.
- Renderizar `<MFAddressConfirmDialog>` com `contextLabel={loja.nome}`, `onConfirm={() => handleSend(confirmLojaId!)}`.

## `MFEntregadoresDisponiveis.tsx`
- Receber também `estado: string` e `telefone?: string` (passados de Carrinho — já existem lá).
- Novo estado `confirmEntregadorId: string | null`.
- Botão "Chamar": `onClick={() => setConfirmEntregadorId(e.id)}` em vez de chamar `handleChamar` diretamente.
- Renderizar o mesmo `<MFAddressConfirmDialog>` no fim do componente com `contextLabel={\`${entregador.nome_completo} — ${VEICULO_LABEL[entregador.veiculo]}\`}`, `confirmLabel="Confirmar e chamar"`, `onConfirm={() => handleChamar(entregador)}`.

## Fora de escopo
- Editar o endereço dentro do modal (continua no card do carrinho).
- Mudanças em `whatsapp.ts`, edge functions, banco ou na mensagem enviada.
- Mudanças em outros pontos que abrem WhatsApp fora do carrinho.
