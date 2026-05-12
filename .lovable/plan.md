# Aba Sintomas → Checklist de auto-monitoramento

Transformar a aba **Sintomas** do Pós-parto, hoje só leitura, num checklist diário onde a usuária marca os sintomas que está sentindo. Cada registro é salvo localmente com data, formando um diário consultável.

## Comportamento

- Cada sintoma das 4 categorias (emocionais, físicos, comportamentais, cognitivos) vira um item clicável (chip/checkbox).
- Marcar/desmarcar atualiza o registro **do dia atual** (uma entrada por data, no formato `YYYY-MM-DD`).
- Os "sinais de alerta" (red flags) ficam separados, com visual de aviso. Marcar qualquer um exibe um banner pedindo para fazer o EPDS / ligar 188.
- Botão **"Salvar registro de hoje"** confirma a entrada (também salva automaticamente em cada toque, mas o botão dá feedback claro).
- Bloco **Histórico** mostra os últimos 7 dias com contagem de sintomas por categoria.
- Botão **Limpar dia de hoje** para descartar.

## Persistência

- Chave: `wediet:mat:posparto:sintomas:diary` → `Record<dateISO, { emotional: string[], physical: string[], behavioral: string[], cognitive: string[], redFlags: string[] }>`
- Mantém no máximo 90 dias (rolling).
- Usa o helper existente `matGet` / `matSet` em `src/lib/maternidadeStorage.ts` (namespaced por user.id).

## UX (alinhada ao design system)

- Chips selecionáveis: estado normal `bg-white border-pink-100`, estado marcado `bg-[#FFD1E7] border-[#FD46A1] text-[#FD46A1]`.
- Cards com `bg-white/70 backdrop-blur-md`, títulos `text-base` sem ícones decorativos.
- Timeline e seções informativas (intro, períodos esperados) **mantidas** acima do checklist como contexto.
- Banner de alerta (quando red flag marcada): `border-red-300 bg-red-50` com 2 CTAs — "Fazer auto-avaliação (EPDS)" troca de aba e "Ligar 188" via `tel:`.

## Arquivos

- **Editar** `src/components/maternidade/posparto/SymptomsSection.tsx`
  - Adicionar estado controlado por dia, persistência via `matGet`/`matSet`, render dos chips, banner de red flag e bloco de histórico.
  - Manter intro, timeline e textos do JSON intactos.
- **Reutilizar** `src/lib/maternidadeStorage.ts` (sem mudanças).
- **Sem mudanças** no `PospartoPanel.tsx` nem no JSON de conteúdo.

## Fora do escopo

- Não cria tabela no Supabase (fica 100% local, conforme padrão das outras abas de Maternidade).
- Não envia notificações nem dispara ações de WhatsApp.
- Não altera outras abas (Visão Geral, EPDS, Buscar Ajuda, Recursos).
