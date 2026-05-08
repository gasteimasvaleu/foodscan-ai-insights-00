## Diagnóstico de tamanhos

Na largura atual (≈430px), o grid `1.6fr_1fr` com gap dá:
- Coluna esquerda ≈ 241px → com `aspect-[16/9]` o card tem ≈ 135px de altura + barra inferior
- Coluna direita ≈ 151px → com `aspect-[4/5]` quer 189px de altura

Com `items-stretch`, o card direito é forçado à altura do esquerdo, mas seu próprio `aspect-[4/5]` recalcula a largura como `altura × 4/5`, ficando mais estreito que a coluna — daí o espaço vazio à direita.

## Solução

Igualar a altura dos dois cards aumentando levemente o card esquerdo para combinar com a altura natural do card direito (Apple Health), mantendo as proporções.

### Alterações em `src/components/HeroDeckRow.tsx`

1. **Card esquerdo (último treino)**: trocar o placeholder `aspect-[16/9]` por `aspect-[5/4]` (mais alto). Isso dá altura ≈ 193px, praticamente igual aos 189px do card direito → ambos terminam com a mesma altura sem espaço sobrando.
2. **Card direito (Apple Health)**: manter `aspect-[4/5]` — agora ele preenche a coluna inteira porque a altura imposta pelo grid já bate com seu aspect ratio.
3. A imagem da thumbnail do treino continua `absolute inset-0 object-cover`, então se adapta ao novo aspect sem distorcer (corta levemente as laterais).
4. A barra inferior preta (título do treino) continua sobreposta na base, sem mudanças.

Resultado: dois cards um pouco mais altos, alinhados em altura, sem faixa vazia ao lado do Apple Health.
