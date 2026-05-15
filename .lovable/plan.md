## Adicionar card de aviso do prêmio semanal na /quiz

Inserir um novo card logo abaixo do card do header "Quiz" (e acima do card "Exclusivo Pro"), na página `src/pages/Quiz.tsx`, anunciando o prêmio semanal de R$ 500 via Pix para o 1º colocado.

### Conteúdo do card
- Ícone: `Trophy` (lucide-react, já importado) dentro de um badge circular gradiente rosa.
- Título curto: "Prêmio semanal: R$ 500 no Pix"
- Subtexto: "O 1º colocado do ranking semanal leva R$ 500 via Pix toda semana."
- Pequeno selo "Toda semana" no canto.

### Estilo (alinhado ao design system do projeto)
- Card branco com borda `border-[#FD46A1]/40`, `rounded-3xl`, `shadow-xl shadow-pink-100`, padding `p-4` — mesmo padrão visual do card "Exclusivo Pro" logo abaixo, para manter coerência.
- Glows decorativos sutis (blur) em rosa nos cantos, igual ao card Pro.
- Ícone em badge `w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FD46A1] to-[#ff7eb3]` com `Trophy` branco.
- Tipografia: label uppercase `text-[#FD46A1]` + título `text-sm font-semibold text-foreground`.

### Localização exata
Em `src/pages/Quiz.tsx`, inserir o novo bloco entre as linhas 105 (fechamento do card header) e 107 (início do `{!isPro && ...}`), de modo que o card de prêmio apareça sempre, independente de ser Pro.

### Observações
- Apenas mudança de UI; sem lógica, rotas, ou chamadas de dados.
- Sem novas dependências; reutiliza `Trophy` do lucide-react já importado.
