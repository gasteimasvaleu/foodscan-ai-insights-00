

## NutriCoach: Mover chat para modal + criar landing page

### O que muda

A pagina `/nutri-coach` deixa de ser o chat direto. Passa a ser uma pagina com:
1. Card de titulo no padrao do app (gradiente rosa, icone, titulo "NutriCoach")
2. Card descritivo explicando a funcionalidade do chat com botao rosa "Abrir Chat"
3. Ao clicar no botao, abre um Dialog fullscreen com fundo branco contendo todo o chat (mensagens + input)

### Alteracoes

**Arquivo: `src/pages/NutriCoach.tsx`**

1. Adicionar estado `chatOpen` para controlar o Dialog
2. Reestruturar o return:
   - Layout externo: Navbar + container com card de titulo (mesmo padrao do AppleHealth — gradiente rosa, icone Bot, titulo "NutriCoach") + card descritivo (fundo `#FFD1E7`, rounded-3xl) com texto sobre o que o NutriCoach faz e botao rosa "Abrir Chat"
   - Dialog (do shadcn): fundo branco, fullscreen no mobile (`w-[calc(100%-2rem)] max-w-lg h-[85vh]`), rounded-2xl, border-2 border-primary, shadow-xl. Conteudo interno: area de mensagens com scroll + input fixo no bottom do dialog (nao mais fixo na tela)
3. Mover o input area de `fixed bottom-20` para dentro do dialog (posicionado com flex column, input no final)
4. Toda a logica de streaming, mensagens, userContext permanece igual — so muda o layout

### Padrao visual
- Card titulo: `bg-gradient-to-r from-red-500/20 via-pink-500/20 to-primary/20 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl` (igual AppleHealth)
- Card descricao: `bg-[#FFD1E7] rounded-3xl shadow-xl` com texto e botao
- Botao: `bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-2xl w-full`
- Modal: `bg-white rounded-2xl border-2 border-primary shadow-xl` com altura fixa ~85vh, flex column, mensagens scrollaveis, input no fundo do modal

