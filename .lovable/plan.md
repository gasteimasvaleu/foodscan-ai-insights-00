

## Plano: Infraestrutura para Widget iOS + Instruções de Build

### O que o Lovable vai fazer (código web + plugin nativo)

#### 1. Plugin Capacitor `SharedDataPlugin`
- **`ios/App/App/SharedDataPlugin.swift`** — Plugin que salva dados no `UserDefaults(suiteName: "group.app.dietainteligente")` com método `saveWidgetData` e `clearWidgetData`
- **`ios/App/App/SharedDataPlugin.m`** — Bridge Objective-C

#### 2. Registrar plugin no `MyViewController.swift`
- Adicionar `bridge?.registerPluginInstance(SharedDataPlugin())` no `capacitorDidLoad()`

#### 3. Hook `useWidgetSync.ts`
- Novo hook que detecta plataforma nativa e chama `SharedDataPlugin.saveWidgetData()` com dados de calorias, refeições e hidratação

#### 4. Integrar no `DailyControl.tsx`
- Chamar `useWidgetSync` passando goals, meals e hydrationTotals para sincronizar automaticamente

#### 5. Atualizar `App.entitlements`
- Adicionar `com.apple.security.application-groups` → `["group.app.dietainteligente"]`

#### 6. Gerar arquivos de referência do Widget (SwiftUI)
- Criar arquivos em `ios-widget-reference/` com o código SwiftUI do widget (Timeline Provider, View, Entry) para você copiar no Xcode ao criar o Widget Extension target

---

### O que você precfazer localmente (passo a passo)

#### Pré-requisitos
- Mac com Xcode 15+
- Projeto clonado via GitHub e atualizado (`git pull`)

#### Passos após o Lovable aplicar as mudanças:

1. **Git pull** o projeto atualizado

2. **Instalar dependências e sincronizar**
   ```bash
   npm install
   npm run build
   npx cap sync ios
   ```

3. **Abrir no Xcode**
   ```bash
   npx cap open ios
   ```

4. **Configurar App Groups no target principal**
   - No Xcode, selecione o target **App** → **Signing & Capabilities**
   - Clique em **+ Capability** → **App Groups**
   - Adicione: `group.app.dietainteligente`

5. **Criar o Widget Extension**
   - No Xcode: **File → New → Target → Widget Extension**
   - Nome: `WeDietWidget`
   - Desmarcar "Include Configuration App Intent"
   - Ativar o mesmo App Group (`group.app.dietainteligente`) no target do widget
   - Substituir o código gerado pelo conteúdo dos arquivos em `ios-widget-reference/`

6. **Build e teste**
   - Selecione o scheme do app principal (não o do widget)
   - Build e rode no simulador ou device
   - O widget aparecerá na galeria de widgets do iOS

7. **Submeter à App Store**
   - Archive pelo Xcode (Product → Archive)
   - Upload via App Store Connect
   - Isso também inclui o fix do PaywallScreen no bundle nativo

### Detalhes técnicos

- **App Groups** permite que o app principal e o widget compartilhem dados via `UserDefaults(suiteName:)`
- O plugin salva um JSON com: `caloriesTarget`, `caloriesConsumed`, `mealsCount`, `hydrationMl`, `lastUpdate`
- O widget usa `TimelineProvider` para ler esses dados e atualizar a cada 15 min
- Os arquivos de referência SwiftUI terão o layout visual similar ao screenshot (circular progress de calorias, contagem de refeições, indicador de hidratação)

