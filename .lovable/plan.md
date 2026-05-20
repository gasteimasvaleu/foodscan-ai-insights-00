## Adicionar Card Promocional do Mercado Fácil na Home

### Objetivo
Inserir um card promocional 21:9 após o deck TertiaryDeckRow (Desafio 14 Dias + Conquistas), direcionando para a página `/mercado-facil`.

### O que será feito
1. **Criar novo componente** `src/components/MercadoFacilPromoCard.tsx`
   - Mesmo padrão visual do `NoveltyCard` (aspect 21:9, rounded-3xl, shadow, faixa preta translúcida `bg-black/55 backdrop-blur-sm` na base).
   - Imagem fornecida: `https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/02177928163662711300f35b2a874e35aceb4d35afb57b85ac48c_0.jpeg`
   - Link para `/mercado-facil`
   - Texto na faixa: chamada para donos de bar, conveniência ou mercado se cadastrarem (sem taxas do iFood).

2. **Atualizar** `src/pages/Index.tsx`
   - Importar o novo componente.
   - Inseri-lo entre `<TertiaryDeckRow />` e `<QuickActions />`.

### Detalhes técnicos
- Componente do tipo `Link` do react-router-dom.
- Estrutura: `aspect-[21/9]` + `rounded-3xl` + `overflow-hidden` + `shadow-lg` + imagem absoluta cobrindo tudo + overlay preto translúcido na base com texto.
- Seguir o padrão de acessibilidade do NoveltyCard (`aria-label`).