# Corrigir recusa da Apple - Guideline 1.1 (Conteudo ofensivo)

A Apple nao disse qual tela incomodou. Pelo que existe no app, o mais provavel e o **To Aqui**: paquera, oferecer drink, "pagar a conta", adivinhar quem e e match com estranhos em bares. Para um app de dieta revisado no iPad, isso parece app de encontros com bebida alcoolica. A forma mais segura de aprovar e esconder isso **so no app do iPhone/iPad**. No site continua tudo igual.

## O que muda no app da Apple
1. **To Aqui escondido**: sai do menu Mais, da Home e dos banners; as paginas /to-aqui redirecionam para a Home (como ja fazemos com as paginas de pagamento).
2. **Bebida alcoolica**: tirar do catalogo de hidratacao e das categorias do Mercado Facil (cerveja, drinks, destilados), so no app.
3. **Provador Virtual**: revisar o pedido enviado a IA para recusar fotos com pouca roupa ou de menores, e bloquear o resultado se a IA marcar como improprio.
4. **Comunidade, chat e DMs** (conteudo dos usuarios): conferir se tem botao de denunciar e bloquear usuario em posts, comentarios e mensagens; adicionar onde faltar.
5. Subir o build para **1.1.1 (27)**.

## Resposta para a Apple
Vou te passar um texto em ingles para responder no App Store Connect, explicando o que foi removido e pedindo, se ainda houver problema, que indiquem a tela exata.

## Detalhes tecnicos
- Usar `Capacitor.isNativePlatform()` (mesmo padrao da protecao de rotas iOS) para filtrar itens do menu Mais, cards da Home e rotas /to-aqui*.
- Filtrar itens alcoolicos em `src/data/hydrationCatalog.ts` e `src/lib/mercado-facil/categoryCopy.ts` no nativo.
- Ajustar prompt/validacao na funcao virtual-tryon.
- Bump CURRENT_PROJECT_VERSION 26 -> 27 em project.pbxproj e src/config/version.ts.
