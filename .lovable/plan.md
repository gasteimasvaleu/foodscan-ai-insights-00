# Ajustes temporarios na Home para a revisao da Apple

Mudancas so de esconder/trocar, faceis de desfazer depois da aprovacao.

1. **Esconder o banner do To Aqui** na Home.
2. **Esconder o banner do Quiz (premio de R$100)** na Home.
3. **Trocar o card "Ultimo treino"** (no primeiro bloco de cards) pelo card do **Mercado Facil**: mesma imagem do banner do Mercado Facil, levando para a pagina do Mercado Facil. O banner do Mercado Facil mais abaixo sai, para nao repetir.
4. Subir o build para **1.1.1 (27)**.
5. Te passar um texto em ingles para responder a Apple.

Nada e apagado: as telas do To Aqui e do Quiz continuam existindo no menu Mais. Para liberar de novo, basta me pedir.

## Detalhes tecnicos
- `src/pages/Index.tsx`: comentar `<ToAquiPromoCard />`, `<NoveltyCard />` e `<MercadoFacilPromoCard />` (imports mantidos).
- `src/components/HeroDeckRow.tsx`: substituir o bloco "Ultimo treino" por card com a imagem do MercadoFacilPromoCard e navigate para a rota do Mercado Facil; codigo antigo comentado.
- Bump CURRENT_PROJECT_VERSION 26 -> 27 (project.pbxproj e src/config/version.ts).
