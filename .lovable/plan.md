Transformar o sticky action bar do `/desafio-14-dias` em um card normal (não-fixo) posicionado logo abaixo do botão "Salvar rascunho e voltar depois", mantendo o visual atual mas com a mesma largura do botão.

Mudanças em `src/pages/Desafio14Dias.tsx`:

1. Remover o wrapper `fixed left-0 right-0 z-30 px-4 pointer-events-none` com `style={{ bottom: ... }}` e seu container interno.
2. Mover o card interno (com `bg-white/90 backdrop-blur-md rounded-2xl border border-[#FFD1E7] shadow-lg p-3 ...`) para dentro do `space-y-4` do conteúdo da `DayView`, logo após o botão "Salvar rascunho e voltar depois" (linha ~762).
3. O card herda automaticamente a largura total da coluna (`w-full`), igualando-se ao botão de rascunho.
4. Reverter o `pb-56` do container (linha 273) para o `pb-32` original, já que não há mais barra fixa sobreposta.
5. Manter intacto o conteúdo do card: progresso "Dia X / X/4 itens", barra de progresso e botão "Concluir dia / Marque os 4 / Concluído".