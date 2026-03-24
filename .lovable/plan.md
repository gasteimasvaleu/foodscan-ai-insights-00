

## Alterar Background do App

Trocar o gradiente rosa (`bg-gradient-primary`) por um fundo sólido `#F7FAFB` em todas as páginas.

### Alterações

**1. `tailwind.config.ts`** — Atualizar `gradient-primary` para cor sólida ou adicionar nova utility:
- Mudar `'gradient-primary'` de `linear-gradient(135deg, #CC0055 0%, #FFFFFF 100%)` para simplesmente `#F7FAFB`

**2. Todas as páginas que usam `bg-gradient-primary`** (15 arquivos):
- `Index.tsx`, `Auth.tsx`, `About.tsx`, `FoodScan.tsx`, `DailyControl.tsx`, `FitTracker.tsx`, `Treinos.tsx`, `MasterCheFIT.tsx`, `ServiNUTRI.tsx`, `Subscription.tsx`, `WhatsAppSettings.tsx`, `PaymentSuccess.tsx`, `PaymentCancel.tsx`, `Profile.tsx`, `PhysicalAssessment.tsx`
- Substituir `bg-gradient-primary` por `bg-[#F7FAFB]` em todas as ocorrências

**3. `src/index.css`** — Remover ou manter o gradiente animado do splash (esse é separado e deve continuar magenta)

A abordagem mais limpa: alterar o valor de `gradient-primary` no `tailwind.config.ts` para `'linear-gradient(135deg, #F7FAFB 0%, #F7FAFB 100%)'` — assim uma única mudança atualiza tudo. Porém, semanticamente faz mais sentido trocar por `bg-[#F7FAFB]` nos componentes e remover o gradiente.

Vou optar pela abordagem simples: mudar o valor do `backgroundImage.gradient-primary` no tailwind config para a cor sólida, atualizando todas as páginas de uma vez.

