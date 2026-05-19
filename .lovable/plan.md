## Ajustes em `src/pages/ToAquiVenue.tsx`

### 1. Fundo no padrão do app
Trocar `bg-[#F7FAFB]` (loading, not-found e wrapper principal) por:
```
bg-gradient-to-br from-background via-background to-primary/5
```
mesmo padrão usado em `/profile/workout`.

### 2. Borda rosa no card header
No card principal (linha 42), trocar:
```
bg-white rounded-3xl shadow-sm overflow-hidden mb-4
```
por:
```
bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-3xl overflow-hidden mb-4 shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)]
```

### 3. Card "Comida" (descrição do venue)
Reaproveitar o padrão dos cards de exercício do WorkoutPlan:
- Container com borda esquerda gradient rosa (`before:` pseudo) + borda fina rosa.
- Header com label "COMIDA" em uppercase + ícone `Utensils` (lucide).
- Conteúdo em bloco `rounded-xl bg-[#FFD1E7]/30 border border-[#FD46A1]/15 p-4`.
- Mostrar `venue.description` com bom espaçamento e tipografia (`text-sm text-gray-700 leading-relaxed`).

### 4. Card "Regras do chat"
Mesmo tratamento:
- Card branco com borda rosa e barra lateral gradient.
- Header com label "REGRAS DO CHAT" + ícone `ShieldCheck`.
- Cada linha de regra (split por `\n`) renderizada como item com ícone `Check` rosa pequeno à esquerda, dentro de `rounded-xl bg-[#FFD1E7]/30 border border-[#FD46A1]/15 p-3`.
- Se houver só um parágrafo, exibe como bloco único.

### 5. Detalhes
- Manter conteúdo e dados existentes intactos (apenas apresentação).
- Manter `pt-[calc(env(safe-area-inset-top)+4rem)] pb-28` e `max-w-2xl mx-auto`.
- Sem alterações em rotas, hooks ou dados.

Confirma que avanço com a implementação?