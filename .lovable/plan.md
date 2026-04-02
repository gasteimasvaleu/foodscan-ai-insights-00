

## Adicionar Card Accordion com Dicas de Sono na Página /sono

### O que será feito
Adicionar um card estilo accordion no final da página de Sono (antes do Drawer) com conteúdo educativo rico sobre sono, organizado em seções expansíveis.

### Accordions planejados

1. **Dicas para Dormir Melhor** — Higiene do sono, rotina, ambiente ideal, temperatura, luz azul, técnicas de relaxamento
2. **Fases do Sono** — Sono leve (N1/N2), sono profundo (N3), sono REM, ciclos de 90 min, importância de cada fase
3. **Sono e Dieta** — Como alimentação afeta o sono, alimentos que ajudam/atrapalham, horário da última refeição, cafeína, álcool
4. **Sono e Exercício Físico** — Relação entre treino e qualidade do sono, melhor horário para treinar, overtraining e insônia
5. **Sinais de Alerta** — Quando procurar um especialista, apneia, insônia crônica, sonolência excessiva
6. **Quanto Tempo Devo Dormir?** — Recomendações por faixa etária, débito de sono, mitos sobre "dormir pouco"

### Detalhes técnicos

**Arquivo alterado**: `src/pages/Sleep.tsx`

- Importar `Accordion, AccordionContent, AccordionItem, AccordionTrigger` de `@/components/ui/accordion`
- Importar ícones adicionais como `Brain, Apple, Dumbbell, AlertTriangle, Info` do lucide-react
- Adicionar o card accordion após o card "Mensagem Motivacional" (antes do Drawer, ~linha 463)
- Estilo do card: mesmo padrão `rounded-3xl border-primary/20 bg-primary/10 shadow-xl`
- Cada AccordionItem terá conteúdo com listas, destaques e dicas práticas
- Usar `type="multiple"` no Accordion para permitir abrir vários ao mesmo tempo

