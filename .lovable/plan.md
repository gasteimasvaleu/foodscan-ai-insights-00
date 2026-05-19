## Apagar cards na atividade do Tô Aqui

Em `/to-aqui/venue/:id/atividade`, adicionar a opção de remover (esconder) cards de interação. Como o registro pertence aos dois lados (sender/receiver), usar **soft-hide por usuário** para que apagar para mim não apague para o outro.

### Banco (migration)

Tabela `venue_interactions`:
- Adicionar `hidden_for_sender boolean default false` e `hidden_for_receiver boolean default false`.
- Atualizar a policy de UPDATE para permitir que cada lado atualize apenas o próprio flag:
  - sender pode setar `hidden_for_sender`
  - receiver continua podendo atualizar (já tem policy `auth.uid() = receiver_id`); ampliar para `auth.uid() IN (sender_id, receiver_id)` apenas para esses dois campos via trigger de validação, ou simplificar criando uma policy adicional `FOR UPDATE USING (auth.uid() = sender_id)` (mais simples e seguro o suficiente porque a UI só toca nesses flags).

### Frontend (`src/pages/ToAquiActivity.tsx`)

1. Selecionar também `hidden_for_sender, hidden_for_receiver` na query.
2. Filtrar localmente: ocultar linhas onde o flag do meu lado está `true`.
3. Adicionar botão "X" (ícone `Trash2` ou `X` da lucide) no canto superior direito de cada card, com `AlertDialog` de confirmação ("Remover essa interação da sua lista?").
4. Ao confirmar, fazer `update` no campo correto (`hidden_for_sender` ou `hidden_for_receiver`) conforme `isSent`, atualizar `rows` no estado e mostrar toast.
5. Visual do botão: pequeno, `text-gray-400 hover:text-[#FD46A1]`, posicionado depois do CTA principal (Abrir/Retribuir/Aguardando).

Nenhuma mudança em outras telas; o registro continua visível para a outra pessoa até que ela também o oculte.
