

## Ajuste de padding inferior na página NutriCoach

O card "Seu Assistente de Nutrição" está parcialmente escondido atrás da navbar inferior (tubelight). O `pb-28` atual não é suficiente.

### Alteração

**`src/pages/NutriCoach.tsx`** (linha 217):
- Trocar `pb-28` por `pb-40` no container principal, garantindo espaço suficiente para o conteúdo não ficar atrás do menu inferior.

