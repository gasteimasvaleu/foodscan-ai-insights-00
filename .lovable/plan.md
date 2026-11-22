# Remover botão Google Play da tela /assinar

- Na versão web da tela de assinar, tirar o botão "Google Play" e deixar só o botão "App Store", ocupando a largura toda.
- Remover o link da Play Store do código.
- O texto legal do Android continua no código (só aparece se um dia houver app Android).

## Detalhes técnicos
- src/components/PaywallScreen.tsx: remover `PLAY_STORE_URL` e o segundo `Button`; trocar `grid grid-cols-2` por um único botão `w-full`.
