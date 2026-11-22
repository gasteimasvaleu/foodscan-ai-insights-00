# Jejum: limite de duração e aviso de saúde

## O que está errado (conferido na sua conta)
- Um jejum começou em 01/04 e só foi encerrado em 21/04 (cerca de 480 h). Outro durou cerca de 63 h (14/05 a 17/05). Tudo indica que o timer ficou ligado sem querer.
- Como a média e o recorde contam esses jejuns, os números ficam irreais (média de 108,8 h e recorde de 480 h).
- Também entram na conta jejuns de poucos segundos, que foram iniciados e encerrados logo em seguida.

## O que muda
1. **Limite de 72 horas**
   - Se você abrir a tela com um jejum ligado há mais de 72 h, o app encerra o jejum sozinho, salvando 72 h. Aparece o aviso "Encerramos seu jejum em 72 h, o timer ficou ligado".
   - Passadas 72 h, o timer para de contar.
2. **Média e recorde mais confiáveis**
   - Só entram jejuns entre 1 h e 72 h. Jejuns de poucos segundos e timers esquecidos ficam de fora.
   - Os seus números já se corrigem sozinhos, sem apagar nenhum registro.
3. **Aviso de saúde**
   - Um texto fixo e discreto na tela: "Jejuns acima de 24 h só devem ser feitos com acompanhamento médico ou nutricional. Se sentir tontura, fraqueza ou mal-estar, interrompa o jejum."
   - A partir de 24 h de jejum ativo, aparece um aviso em destaque com essa mesma mensagem.

## Detalhes técnicos
- `src/pages/IntermittentFasting.tsx`:
  - Ao carregar, se o jejum ativo tiver `now - started_at > 72h`, fazer `update ended_at = started_at + 72h` e mostrar o aviso.
  - Estatísticas: filtrar as durações para `1 <= h <= 72` antes de calcular a média e o recorde (o tratamento de lista vazia continua o mesmo).
  - Mostrar o aviso fixo e o alerta quando o jejum ativo passar de 24 h.
- Sem mudança no banco. No iPhone, a mudança chega por um Live Update.
