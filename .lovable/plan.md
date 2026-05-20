# Faixa de preço da entrega no card do entregador

## Contexto

Hoje a `taxa_centavos` da entrega vem da loja (`taxa_entrega_padrao_centavos`) e na maioria dos casos vale R$ 0,00, então o cliente não tem ideia de quanto vai pagar. Vamos deixar o próprio entregador declarar uma **faixa de preço** (mínimo e máximo) que ele cobra na cidade dele, e mostrar essa faixa no card antes do cliente chamá-lo.

## Mudanças

### 1. Banco — `mf_entregadores`
Adicionar duas colunas opcionais:
- `taxa_min_centavos integer` (default 0)
- `taxa_max_centavos integer` (default 0)

Sem CHECK constraint; valida no front. Quando ambos forem 0, o card mostra "A combinar".

### 2. Tipos — `src/lib/mercado-facil/entregador-types.ts`
Adicionar os dois campos à interface `MFEntregador`.

### 3. Cadastro do entregador — `EntregadorCadastro.tsx`
Novo bloco "Faixa de preço por entrega" com dois `Input` (R$ mínimo e R$ máximo), salvos em centavos. Texto auxiliar: "Valor de referência. O combinado final é feito no WhatsApp com o cliente."

### 4. Card do entregador — `MFEntregadoresDisponiveis.tsx`
Abaixo do nome/veículo/estrela, mostrar uma **faixa rosa**:
- `min > 0 && max > 0 && min !== max` → "R$ 8,00 – R$ 25,00"
- `min === max && min > 0` → "R$ 10,00"
- ambos 0 → "Preço a combinar"

Visual: pill `bg-[#FD46A1] text-white text-[11px] px-2 py-0.5 rounded-full`.

### 5. Mensagem do WhatsApp — `whatsapp.ts`
Se o entregador tem faixa preenchida, incluir uma linha:
> "Sua faixa de entrega cadastrada: R$ X – R$ Y. Você confirma?"

### 6. Página de entregas disponíveis — `EntregadorEntregas.tsx`
Quando `taxa_centavos === 0`, em vez de "R$ 0,00", mostrar "A combinar" no canto do card (cosmético, deixa claro que o valor será fechado no WhatsApp).

## Fora de escopo

- Não vamos alterar `mf_entregas.taxa_centavos` automaticamente — continua sendo o valor combinado/final. A faixa é só uma referência visível ao cliente e ao próprio entregador.
- Sem fluxo de "aceitar contraproposta" no app.
