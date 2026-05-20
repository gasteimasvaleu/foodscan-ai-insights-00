## Refino UX da página Config Loja + seletor de Estado

### Arquivo: `src/pages/mercado-facil/LojistaConfigLoja.tsx`

**1. Novo campo Estado (UF)**
- Estado local `uf` (string, 2 letras).
- Carregado de `l.endereco?.uf ?? ""` no `useEffect`.
- Salvo em `endereco: { cidade, bairro, uf }` no `handleSave`.
- Componente `Select` (shadcn já em uso no projeto) com as 27 siglas brasileiras: AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO.
- Layout em grid de 3 colunas na linha Cidade/Bairro/UF (ou Cidade 2col + UF 1col em mobile estreito → manter grid-cols-3 simples).

**2. UX em card único**
- Envolver todos os campos (Nome, WhatsApp, Descrição, Cidade/Bairro/UF, Foto) em um único `<div>` com estilo de card branco glassmorphism: `bg-white/70 backdrop-blur-md rounded-3xl p-5 space-y-4 shadow-sm border border-white/40`.
- Botão Salvar fica fora do card, abaixo.
- Manter `max-w-xl mx-auto` no main.

### Sem alterações de banco
- `endereco` já é `jsonb` em `mf_lojas`, aceita `uf` sem migração.
- Nenhum outro componente lê `endereco.uf` ainda — apenas extensão opcional.