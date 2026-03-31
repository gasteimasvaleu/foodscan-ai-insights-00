
Objetivo
- Adicionar a opção de remover uma bebida diretamente no card **“Bebidas consumidas hoje”** na página `/hidratacao`.

Escopo
- Alterar apenas `src/pages/Hydration.tsx`.
- Sem mudanças de banco/migração (já existe RLS para DELETE em `hydration_records` por `user_id`).

Plano de implementação

1) Criar ação de exclusão por item
- Implementar uma função `handleDeleteRecord(recordId: string)` em `Hydration.tsx`.
- Fluxo da função:
  - Validar `user`.
  - Executar `supabase.from("hydration_records").delete().eq("id", recordId).eq("user_id", user.id)`.
  - Exibir toast de sucesso/erro.
  - Recarregar dados com `loadHydrationData()` após sucesso.

2) Adicionar botão de remover em cada bebida do card
- No map de `todayRecords`, substituir o bloco da direita (horário) por um container com:
  - horário (mantido);
  - botão de remover (ícone de lixeira ou “Remover”) com estilo discreto (`ghost`/`destructive` conforme padrão visual atual).
- Garantir que o botão fique acessível em mobile (390x640), sem quebrar truncamento do nome/infos.

3) Melhorar UX durante exclusão
- Adicionar estado local para evitar cliques repetidos (ex.: `deletingRecordId`).
- Desabilitar o botão do item enquanto remove e, opcionalmente, mostrar micro feedback (“Removendo…”).

4) Manter comportamento consistente de totais
- Como os cards da tela usam `records` carregados de `hydration_records`, ao deletar e recarregar:
  - lista “Bebidas consumidas hoje” atualiza;
  - progresso de hidratação e gráfico semanal refletem a remoção automaticamente.

Validação
- Em `/hidratacao`:
  - Registrar bebida;
  - Remover no card “Bebidas consumidas hoje”;
  - Confirmar atualização imediata da lista, progresso e totais;
  - Testar em viewport 390x640 para garantir layout sem overflow.
