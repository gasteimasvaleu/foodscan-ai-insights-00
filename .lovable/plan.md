

## Guia in-app: Como conectar apps externos ao WeDiet via Apple Health

### O que será feito
Adicionar um card/seção expansível (Accordion) na página `/apple-health` com um guia passo-a-passo visual explicando como conectar Strava, Garmin e Nike Run Club ao WeDiet através do Apple Health.

### Localização
Na página `src/pages/AppleHealth.tsx`, logo após o card "Atividades de Apps Conectados" (quando conectado) ou após o botão "Acessar FitTracker" (quando desconectado).

### Design do componente
Um card com ícone de ajuda e título "Como conectar apps externos", usando `Accordion` do shadcn para manter compacto:

- **Item 1 — Strava**: 3 passos (Abrir Strava → Configurações → Saúde → Ativar Apple Health → Permitir escrita de treinos)
- **Item 2 — Garmin Connect**: 3 passos similares (Garmin Connect → Configurações → Saúde → Apple Health)
- **Item 3 — Nike Run Club**: 3 passos similares
- **Item 4 — Verificação**: Como confirmar que funciona (Ajustes iOS → Saúde → Acesso e Dispositivos → verificar que o app aparece com permissões ativas)

Cada item terá o ícone e cor do respectivo app (reutilizando `SOURCE_STYLES` já existente) e instruções numeradas com texto curto.

### Alterações

**1. `src/pages/AppleHealth.tsx`**
- Importar `Accordion, AccordionContent, AccordionItem, AccordionTrigger` de `@/components/ui/accordion`
- Importar `HelpCircle, CheckCircle2, Settings` de lucide
- Adicionar novo card após o card de "Atividades de Apps Conectados" com o guia expansível
- Cada accordion item mostra passos numerados com ícones coloridos por app

