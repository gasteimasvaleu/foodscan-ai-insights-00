

## Modernizar sistema de adicionar exercício com modal

Excelente ideia! Vamos substituir o sistema atual (que adiciona um exercício genérico inline) por um modal completo e estruturado com grupos musculares, exercícios específicos, explicação de execução, séries, repetições e observações.

### Mudanças

**1. Atualizar a interface `Exercise` em `src/pages/WorkoutPlan.tsx`**

Adicionar campos `muscleGroup` e `executionTip` à interface existente.

**2. Criar dados de grupos musculares e exercícios**

Objeto com grupos musculares e seus exercícios, cada um com dica de execução:

- **Peito**: Supino reto, Supino inclinado, Crucifixo, Crossover, Flexão de braço, Supino declinado, Pullover
- **Costas**: Puxada frontal, Remada curvada, Remada unilateral, Pulldown, Remada cavaleiro, Barra fixa, Remada baixa
- **Ombros**: Desenvolvimento militar, Elevação lateral, Elevação frontal, Crucifixo inverso, Arnold press, Encolhimento
- **Bíceps**: Rosca direta, Rosca alternada, Rosca martelo, Rosca concentrada, Rosca Scott, Rosca inversa
- **Tríceps**: Tríceps pulley, Tríceps testa, Tríceps francês, Mergulho, Tríceps coice, Tríceps corda
- **Pernas (Quadríceps)**: Agachamento livre, Leg press, Cadeira extensora, Agachamento hack, Agachamento búlgaro, Passada
- **Pernas (Posterior)**: Cadeira flexora, Stiff, Mesa flexora, Levantamento terra romeno, Good morning
- **Glúteos**: Hip thrust, Elevação pélvica, Abdução de quadril, Kickback, Agachamento sumô
- **Panturrilha**: Panturrilha em pé, Panturrilha sentado, Panturrilha no leg press, Panturrilha unilateral
- **Abdômen**: Abdominal crunch, Prancha, Elevação de pernas, Abdominal oblíquo, Roda abdominal, Mountain climber
- **Antebraço**: Rosca de punho, Rosca inversa de punho, Farmer walk

Cada exercício terá uma string de dica de execução (1-2 frases).

**3. Criar modal de adicionar exercício**

Usando o padrão do site: `Dialog` + `DialogContent` com classes `w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl`.

O modal conterá:
- **Select de Grupo Muscular** (lista dos grupos acima)
- **Select de Exercício** (filtra baseado no grupo selecionado)
- **Dica de execução** exibida automaticamente ao selecionar o exercício (card informativo)
- **Input numérico de Séries** (default: 3)
- **Input de Repetições** (default: "10-12")
- **Textarea para Observações**
- **Botão "Adicionar"**

**4. Melhorar exibição dos exercícios na lista**

Mostrar o grupo muscular como badge e exibir a dica de execução em um tooltip ou texto menor.

### Detalhes técnicos

- Todo o código fica em `src/pages/WorkoutPlan.tsx` (dados do catálogo + modal)
- Imports adicionais: `Dialog, DialogContent, DialogHeader, DialogTitle`, `Select, SelectContent, SelectItem, SelectTrigger, SelectValue`, `Textarea`, `Label`, `Badge`, `Info` icon
- Interface `Exercise` passa a ter: `name`, `muscleGroup`, `sets`, `reps`, `notes`, `executionTip`
- Compatibilidade: exercícios antigos sem `muscleGroup` continuam funcionando (fallback)
- Nenhuma alteração de banco de dados necessária (exercícios são JSONB)

