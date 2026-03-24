

## Redesign QuickActions como cards coloridos empilhados

Transformar os botões de ações rápidas em cards grandes, coloridos, empilhados verticalmente (como no screenshot de referência), usando a paleta rosa/magenta do screenshot 2.

### Design dos cards

Cada card será full-width, com ~100px de altura, cantos arredondados, contendo:
- Icone + titulo em bold à esquerda
- Tags/badges com as descrições
- Botão circular com seta (→) à direita
- Cards levemente sobrepostos (margin negativa entre eles)

### Paleta de cores (baseada no screenshot 2 - gradiente rosa/magenta)

1. Meu Perfil: `from-fuchsia-400 to-pink-500`
2. Escanear Comida: `from-pink-400 to-rose-500`
3. Registrar Exercício: `from-rose-400 to-pink-600`
4. Ver Treinos: `from-pink-500 to-fuchsia-500`
5. Gerar Cardápio: `from-fuchsia-500 to-pink-600`
6. WhatsApp: `from-rose-500 to-fuchsia-600`

### Alterações

**`src/components/QuickActions.tsx`** - Reescrever completamente:
- Remover Card wrapper externo, titulo "Ações Rápidas" e subtitulo
- Cada ação vira um card grande full-width com layout horizontal (icone+texto à esquerda, seta à direita)
- Adicionar badges/tags com palavras-chave (como no screenshot)
- Cards com margin negativa entre si para efeito de sobreposição
- Incluir "Meu Perfil" e "WhatsApp" como cards iguais aos demais
- Botão circular escuro com icone ArrowRight à direita

**`src/pages/Index.tsx`** - Ajustar para que QuickActions fique colado ao menu inferior removendo o `space-y-8` ou ajustando o espaçamento.

