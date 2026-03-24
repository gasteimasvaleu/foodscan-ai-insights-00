

## Alteração da Paleta de Cores — We Diet

Substituir a paleta atual (roxo/violeta `#6C63FF`) pela nova paleta rosa/magenta do screenshot.

### Nova Paleta
- **Magenta Principal**: `#CC0055`
- **Rosa Vibrante**: `#FF1493`
- **Rosa Claro**: `#FFB6C1`
- **Rosa Suave**: `#FFE4EF`
- **Branco**: `#FFFFFF`

### Arquivos a alterar

**1. `tailwind.config.ts`** — Atualizar cores primary e gradientes:
- `primary.DEFAULT`: `#CC0055`
- `primary.50`: `#FFF5F8` (tom muito claro derivado)
- `primary.100`: `#FFE4EF` (Rosa Suave)
- `primary.500`: `#CC0055` (Magenta Principal)
- `primary.600`: `#B3004B`
- `primary.700`: `#99003F`
- `success` mantém verde (funcional)
- Gradientes: `from-#CC0055 to-#FF1493`

**2. `src/index.css`** — Atualizar CSS variables:
- `--primary` HSL equivalente de `#CC0055`
- Splash screen gradients: usar tons magenta/rosa

**3. `src/components/Header.tsx`** — Atualizar cores do `GradientText` e badges

**4. `src/components/FeaturesSection.tsx`** — Atualizar referências `primary-*` e gradientes `from-primary-500 to-purple-600` para `from-primary-500 to-pink-500`

**5. `src/components/EcosystemSection.tsx`** — Atualizar gradientes de `purple-600` para `pink-500`

**6. Componentes com referências hardcoded a roxo/purple** — Buscar e substituir `purple-600`, `violet-500`, `#6C63FF` etc. por equivalentes rosa/magenta

