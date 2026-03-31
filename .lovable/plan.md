
Objetivo: corrigir a responsividade do modal de “Registrar bebida” no mobile (390x640) e alinhar 100% ao padrão visual dos demais modais do app.

1) Padronizar container do modal (arquivo `src/pages/Hydration.tsx`)
- Atualizar `DialogContent` para o mesmo padrão usado em outras telas:
  - `w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl`
- Adicionar comportamento mobile seguro:
  - `max-h-[85vh] overflow-y-auto` para evitar corte de conteúdo
  - espaçamento interno consistente (`p-4 sm:p-6`) e `gap` adequado

2) Ajustar layout interno para não “espremer”
- Seção “Escolha a bebida”:
  - trocar lista horizontal apertada por layout responsivo com quebra (grid/flex-wrap), mantendo boa área de toque
  - garantir labels sem estourar (truncate/line-clamp onde necessário)
- Seção “Quantidade (ml)”:
  - manter botões com quebra responsiva e largura mínima confortável
  - preservar input numérico abaixo dos botões, com spacing consistente
- Seção “Prévia” e botão “Salvar consumo”:
  - manter legíveis em uma coluna única, sem overflow lateral

3) Evitar conflito com botão de fechar do Dialog
- Reservar espaço no topo do conteúdo (`pr-8` no header/conteúdo superior) para o “X” não sobrepor título/textos.

4) Consistência com padrões do app
- Aplicar classes de glassmorphism já usadas em outros modais (`bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl`).
- Manter cantos e hierarquia visual iguais aos modais de `Profile`, `MyDiets`, `ChartsProgress`, etc.

5) Validação funcional e visual (mobile-first)
- Verificar no `/hidratacao` (390x640):
  - modal abre centralizado, sem corte;
  - conteúdo rola verticalmente quando necessário;
  - botões/chips não ficam comprimidos;
  - botão “Salvar consumo” sempre acessível;
  - visual consistente com os outros modais do app.
