

## Fix: Mover Card Motivacional para fora do loop de histórico

### Problema
O card "Mensagem Motivacional" está incorretamente inserido **dentro** do `.map()` do histórico de registros (linha 399), aninhado dentro do `div` de estrelas de qualidade. Isso faz com que o card não renderize corretamente — ele fica repetido dentro de cada registro e quebra o layout.

### Correção
1. **Remover** o bloco do card motivacional de dentro do loop (linhas 399-443)
2. **Inserir** o mesmo bloco como card independente **após** o card de Histórico Recente (após a linha 461, antes do `</div>` que fecha a seção principal)
3. Fechar corretamente o `div` de estrelas que ficou aberto (adicionar `</div>` que estava faltando na linha 398)

### Arquivo alterado
- `src/pages/Sleep.tsx` — reorganizar a posição do card motivacional

