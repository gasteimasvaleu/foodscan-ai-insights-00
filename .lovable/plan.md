
## Ajustar o plano do NutriCoach para reduzir altura e subir o modal

### O que vou mudar
Além das correções estruturais para remover o overflow horizontal, vou aplicar também o ajuste que você pediu no próprio modal do chat:

1. **Diminuir a altura vertical do modal**
   - Em `src/pages/NutriCoach.tsx`, reduzir de algo como `h-[85dvh]` para um valor menor e mais seguro no iPhone, por exemplo `h-[70dvh]` ou `max-h-[70dvh]`.
   - Assim o teclado terá mais espaço para abrir sem encostar no chat.

2. **Subir o modal alguns pixels**
   - Em vez de deixar o modal colado no bottom, posicionar com uma folga, por exemplo `!bottom-24` ou outro espaçamento compatível com a navbar/tab bar.
   - Isso cria um “respiro” visual e reduz a chance de o teclado empurrar o modal.

3. **Parar de usar o posicionamento centrado herdado do Dialog**
   - Neutralizar totalmente `left-[50%]` e `translate-x/y` do `DialogContent`.
   - Usar um layout mobile explícito, com `!left-4 !right-4 !w-auto !max-w-none !translate-x-0 !top-auto`.
   - Isso evita cálculo ruim de largura quando o teclado abre.

4. **Bloquear overflow horizontal no app inteiro**
   - `src/App.css`: remover o estilo padrão do Vite em `#root` (`max-width`, `margin`, `padding`) e trocar por um container full-width/mobile-safe.
   - `src/index.css`: adicionar `overflow-x-hidden` e `max-width: 100%` em `html`, `body` e `#root`.

5. **Eliminar fontes extras de largura**
   - `src/components/ui/tubelight-navbar.tsx`: ajustar o fundo com `-inset-x-6`, porque ele pode estar passando da viewport e contribuindo para o scroll lateral.
   - `src/pages/NutriCoach.tsx`: aplicar `min-w-0`, `break-words` e contenção interna nas bolhas e na área de input.

### Resultado esperado
- O modal fica **mais baixo**
- O modal fica **mais para cima**
- O teclado abre com folga, sem encostar no chat
- O app nativo deixa de ganhar scroll horizontal
- Quando o teclado fechar, o modal continua estável e proporcional

### Detalhes técnicos
```text
Estratégia final:
- reduzir altura do chat
- subir o chat acima da área crítica do teclado/navbar
- remover overflow-x global
- neutralizar o Dialog desktop-style
- impedir que navbar e mensagens expandam a largura
```
