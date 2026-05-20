# Corrigir entrega que não aparece para o entregador

## Causa raiz

A entrega criada pelo cliente foi salva com `cidade = "Joao pessoa"`, mas o entregador está cadastrado como `cidade = "joao pessoa"`. A consulta em `useMFEntregas` (scope `entregador-disponivel`) compara com `.eq("cidade", cidade)`, que é sensível a maiúsculas e acentos. Resultado: a entrega existe (`status='disponivel'`, `entregador_id=null`) mas nunca casa com a cidade do entregador.

## Solução

Normalizar a cidade (trim + lower + remover acentos) em todos os pontos de escrita e leitura, e fazer backfill das linhas existentes.

## Mudanças

1. **`src/lib/mercado-facil/formatters.ts`** — adicionar helper `normalizeCidade(s)` (`s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim()`).

2. **`src/lib/mercado-facil/whatsapp.ts`** — aplicar `normalizeCidade(cidade)` no insert em `mf_entregas`.

3. **`src/pages/mercado-facil/EntregadorCadastro.tsx`** — aplicar `normalizeCidade` ao salvar a cidade do entregador.

4. **`src/hooks/mercado-facil/useMFEntregas.ts`** — aplicar `normalizeCidade` no filtro do scope `entregador-disponivel`.

5. **`src/pages/mercado-facil/EntregadorEntregas.tsx`** — passar `normalizeCidade(entregador.cidade)` ao hook.

6. **Migração SQL (backfill)** — `update mf_entregas set cidade = lower(unaccent(btrim(cidade)))` e o mesmo para `mf_entregadores`, garantindo que a entrega atual (`Joao pessoa`) passe a casar.

## Observações

- Apenas frontend + um backfill SQL pontual; nenhuma lógica de negócio nova.
- Mantém compatibilidade com o RPC existente `mf_entregadores_disponiveis` (que já usa `lower(unaccent(...))`).
- A mensagem de WhatsApp continua mostrando a cidade como o cliente digitou (uso a versão normalizada só no banco).
