## Padronizar títulos dos carrosséis na página /loja

Os títulos dos carrosséis ("Novidades", "Vitaminas e Suplementos", "Beleza", "Roupas e Acessórios") usam atualmente `text-lg font-bold text-foreground`, fora do padrão de subtítulos de seção do app.

### Mudança em `src/components/loja/ProductCarousel.tsx`

Alterar a classe do `<h2>` (linha 26):

- **De:** `text-lg font-bold text-foreground`
- **Para:** `text-base font-semibold text-primary`

Isso alinha os títulos dos carrosséis com a cor da marca (rosa magenta) e com o tamanho usado em outros agrupamentos de seção do app (ex.: header de resultados na própria Loja). Nenhuma outra alteração necessária.
