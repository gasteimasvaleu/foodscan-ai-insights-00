## Trocar tabs horizontais por seletor estilo Drawer

No `BebePanel.tsx`, substituir a tira horizontal de 6 botões por um seletor único no padrão drawer já usado no app (ex.: `AIGoalsWizard`, `ExerciseForm`).

### Comportamento
- Botão único de largura total mostrando a seção ativa (ex.: "Sono & Cresc.") + chevron à direita.
- Ao tocar, abre um `Drawer` (de baixo) com as 6 opções em lista vertical.
- Tocar em uma opção define `active`, fecha o drawer.
- Item ativo destacado com `bg-[#FD46A1] text-white`; demais com hover sutil.

### Estilo (consistente com o app)
- Botão trigger: `h-12 rounded-xl bg-white/70 backdrop-blur-md` com texto à esquerda e ícone chevron à direita, cor primária `#FD46A1` no label.
- `DrawerContent`: `w-[calc(100%-2rem)] max-w-md mx-auto rounded-t-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl`.
- `DrawerTitle`: "Selecionar seção".
- Itens: botões `h-12 rounded-xl text-base` em `flex flex-col gap-2 p-4`.

### Arquivos
- Editar: `src/components/maternidade/bebe/BebePanel.tsx` (substituir bloco linhas 42-56 e adicionar estado `pickerOpen`, imports do `Drawer` e ícone `ChevronDown`).

### Fora de escopo
- Não alterar conteúdo das sub-abas nem `BabyProfileCard`.
- Não mudar a ordem das seções.
