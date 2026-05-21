## Mudança em `src/pages/mercado-facil/LojistaPedidos.tsx`

Apenas UI. Trocar o bloco de status atualmente sempre visível (linhas 178-234) por um acordeon controlado por um novo botão full-width, replicando o visual de `MFClientePedidosStatus`.

### Estado

Adicionar `const [openStatusId, setOpenStatusId] = useState<string | null>(null);` para controlar qual card está expandido (um por vez).

### Botão acionador

Abaixo da linha de botões "WhatsApp" + "Entrega" (linha 236-260), adicionar um botão full-width com o mesmo visual do trigger do `MFClientePedidosStatus`:

```tsx
<button
  type="button"
  onClick={() => setOpenStatusId(openStatusId === p.id ? null : p.id)}
  aria-expanded={openStatusId === p.id}
  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-[#FD46A1]/30 bg-white text-left"
>
  <span className="flex items-center gap-2 text-base text-foreground">
    <Package size={16} className="text-[#FD46A1]" />
    Ver status do pedido
    {entrega && (
      <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFD1E7] text-[#FD46A1]">
        {ENTREGA_STATUS_LABEL[entrega.status]}
      </span>
    )}
  </span>
  <ChevronDown
    size={18}
    className={`text-[#FD46A1] transition-transform duration-300 ${openStatusId === p.id ? "rotate-180" : ""}`}
  />
</button>
```

Imports adicionais: `ChevronDown`, `Package` de `lucide-react`.

### Conteúdo do acordeon

Wrapper com mesma transição usada no componente do cliente:

```tsx
<div className={`transition-all duration-300 ease-out overflow-hidden ${openStatusId === p.id ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
  <div className="pt-3">
    {/* bloco atual de status, com layout do cliente */}
  </div>
</div>
```

Dentro do wrapper, renderizar bloco com o mesmo visual do `MFClientePedidosStatus` (caixa `bg-[#FFD1E7]/40 rounded-2xl p-3 space-y-2`):

- Linha com `MapPin` + `endereco_entrega` + valor da taxa à direita
- `tipo === "propria"` → "Entrega feita pela loja"
- `status === "disponivel"` → spinner + "Buscando entregador…"
- `status === "cancelada"` → "Entrega cancelada."
- demais → `<MFEntregaProgress status={...} />`

Sem o bloco de avaliação por estrelas (é exclusivo do cliente).

Se `!entrega`, mostrar dentro do acordeon: `<p className="text-sm text-foreground/60">Nenhuma entrega registrada ainda. Use o botão "Entrega" acima para registrar.</p>`

### Botões de ação do lojista (avançar/cancelar entrega própria)

Mantidos, mas movidos para dentro do acordeon, logo abaixo do `MFEntregaProgress`, exatamente como hoje (linhas 200-232). Só são exibidos quando `entrega.tipo === "propria" && ["aceita","coletada"].includes(entrega.status)`.

### Limpeza

Remover o bloco antigo `{entrega && (...)}` (linhas 178-234) — todo o conteúdo passa a viver dentro do acordeon.

## Fora de escopo

- Sem mudanças em backend, hooks, tipos ou outros arquivos.
- Sem alteração no fluxo de criação/avanço de entrega.