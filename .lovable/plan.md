## Remover ícones antes dos títulos nos cards da seção Recursos (Pós-parto)

Arquivo: `src/components/maternidade/posparto/ResourcesSection.tsx`

### Mudanças

1. **Card "Para parceiros/família"** (linha 117) — remover o ícone `Heart` que aparece antes do parágrafo (elemento selecionado). O texto fica ocupando toda a largura.

2. **Card "Apps recomendados"** (linhas 83-85) — remover o círculo rosa com o ícone `Smartphone` que aparece acima do nome de cada app. O card fica apenas com nome + descrição centralizados.

3. **Card "Emergência"** (linha 36) — remover os ícones `Phone`/`MapPin` que aparecem antes do nome de cada item. O nome e a descrição ficam alinhados à esquerda sem ícone decorativo.

4. **Limpeza de imports** — remover `Phone` (apenas do import decorativo, manter porque ainda é usado no botão de ligar na linha 44), `MapPin`, `Smartphone` e `Heart` dos imports conforme deixarem de ser usados.

### Fora de escopo

- Manter o `ExternalLink` no card "Recursos online" (fica à direita do item, não antes do título, e indica link externo — funcional).
- Manter o `Phone` dentro do botão "ligar" (linha 44) — é ação funcional, não decoração.
- Não alterar cores, espaçamentos, bordas ou textos.