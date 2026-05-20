## Editar entregador + redesenhar card do painel

### 1. Tornar dados do entregador editáveis

Refatorar `EntregadorCadastro.tsx` para funcionar em dois modos:

- **Modo cadastro** (sem entregador): comportamento atual (insert).
- **Modo edição** (entregador existente): pré-preencher campos com dados atuais e fazer `update` em vez de `insert`. Remover o redirect que joga de volta pro dashboard quando já existe entregador.

Adicionar campo opcional **Foto** (URL) — coluna `foto_url` já existe na tabela `mf_entregadores`.

Adicionar botão **"Editar meus dados"** no card do painel (`EntregadorDashboard.tsx`) levando para `/mercado-facil/entregador/cadastro`.

### 2. Redesenhar o card do painel do entregador

Seguindo o layout da referência (mesmo padrão da página da loja):

- Banner rosa no topo (h-28) com gradient + foto do entregador como background, se houver.
- Avatar circular 96px sobrepondo o banner (foto do entregador ou inicial do nome com bg `#FFD1E7`).
- Nome em destaque (text-2xl font-bold) + linha "Cidade/UF · Raio Xkm".
- Badge de status (Aprovado/Pendente/etc) no canto superior direito do banner.
- Três stats em grid abaixo, padrão `bg-[#FFD1E7] rounded-2xl`:
  - **ENTREGAS** (total_entregas)
  - **AVALIAÇÃO** (avaliacao_media)
  - **RAIO** (raio_atendimento_km km)
- Switch "Disponível para entregas" continua dentro do card, abaixo das stats (só se aprovado).

### Fora de escopo

- Não vou adicionar upload de imagem (mantém URL como na config de loja).
- Não mexo nas listas de entregas abaixo do card.
- Sem mudanças de schema (todas as colunas já existem).