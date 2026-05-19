## Problema

Após o usuário clicar em "Abrir conversa" no `MatchRevealBanner`, ele navega para a DM, mas ao voltar pro chat do venue o banner continua lá (porque vem da mensagem `__match_reveal__:` persistida no banco). Hoje não há nenhum mecanismo de "dispensar".

## Solução

Dispensar o banner localmente após o clique, de forma persistente por mensagem.

### 1. `MatchRevealBanner.tsx`
- Aceitar nova prop `messageId: string`.
- Manter estado `dismissed` inicializado lendo `localStorage` da chave `to-aqui:match-reveal-dismissed:${messageId}`.
- Função `openDM`: após `navigate()`, gravar `"1"` em `localStorage` nessa chave e setar `dismissed=true`.
- Se `dismissed === true`, o componente retorna `null` (não renderiza nada).

### 2. `ToAquiChat.tsx` (linha ~844)
- Passar `messageId={m.id}` para o `MatchRevealBanner`.
- Nenhuma outra mudança — a mensagem continua no banco; só o banner fica oculto pra esse usuário neste dispositivo.

## Fora de escopo
- Não mexer no banco nem deletar a mensagem `__match_reveal__:` (ela serve de registro para o caso de o outro participante ainda não ter visto, e o filtro é por usuário/dispositivo).
- Não mexer no toast/dialog do `IncomingGuessDialog` nem na lógica de criação de DM.

## Detalhe técnico
Chave de localStorage isolada por mensagem garante: (a) sobrevive a refresh; (b) cada banner (caso haja vários matches no venue) tem dispensa independente; (c) não afeta o outro participante.
