

## Confirmação: Zero impacto no app nativo

### O que será feito

Mover as regras CSS que escondem scrollbar (`::-webkit-scrollbar { display: none }`, `scrollbar-width: none`, `-ms-overflow-style: none`) para dentro do media query `@media all and (display-mode: standalone)` que **já existe** no arquivo `src/index.css`.

### Por que NÃO afeta o app nativo

1. **O app nativo (Capacitor/WebView) roda em `display-mode: standalone`** — então ele continuará entrando nesse media query e as scrollbars permanecerão escondidas no iOS.
2. **Apenas o browser desktop/web** (que roda em `display-mode: browser`) passará a mostrar scrollbar — exatamente o que você precisa para editar no Lovable.
3. **Nenhum arquivo Swift, Info.plist, entitlements ou nativo é tocado** — é apenas reorganização de CSS dentro do mesmo arquivo.
4. **LiveUpdate entrega a mudança OTA** — o shell nativo nem precisa ser recompilado.

### Arquivo editado

- **`src/index.css`**: Mover 3 propriedades CSS de lugar (do escopo global para dentro do `@media (display-mode: standalone)` já existente)

### Resumo

| Contexto | Scrollbar visível? | Muda algo? |
|---|---|---|
| App iOS nativo (Capacitor) | ❌ Escondida | **Não muda nada** |
| PWA standalone | ❌ Escondida | **Não muda nada** |
| Browser desktop/Lovable | ✅ Visível | **Corrigido** |

