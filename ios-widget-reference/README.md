# Widget iOS — Referência SwiftUI

Este arquivo contém o código de referência para criar o Widget Extension no Xcode.

## Como usar

> ⚠️ **Fluxo obrigatório para não perder o widget**
>
> - Sempre rode **`npm run cap:sync`** (nunca `npx cap sync ios` direto).
> - Faça commit de qualquer alteração nativa (`project.pbxproj`, target widget, entitlements) imediatamente.
> - Se houver conflito em `project.pbxproj` durante pull/rebase, resolva o conflito mantendo o target `WeDietWidget` e o `Embed App Extensions`.

### 1. Criar Widget Extension no Xcode

1. Abra o projeto: `npx cap open ios`
2. **File → New → Target → Widget Extension**
3. Product Name: `WeDietWidget`
4. **Desmarcar** "Include Configuration App Intent"
5. Clique em **Finish**

### 2. Configurar App Group

1. Selecione o target **WeDietWidget** no Xcode
2. Vá em **Signing & Capabilities**
3. **+ Capability → App Groups**
4. Adicione: `group.app.dietainteligente`
5. Faça o mesmo no target **App** (principal) se ainda não fez

### 3. Copiar o código

1. Substitua todo o conteúdo do arquivo `WeDietWidget.swift` gerado pelo Xcode pelo conteúdo de `WeDietWidget.swift` desta pasta.
2. Se o Xcode criou um arquivo `WeDietWidgetBundle.swift`, delete-o (o `@main` já está no `WeDietWidget.swift`).

### 4. Build e teste

1. Selecione o scheme do **app principal** (não o do widget)
2. Build e rode no simulador ou device
3. Na Home Screen, toque e segure → **Editar Home Screen** → **+** → procure "Dieta Inteligente"
4. Adicione o widget (Small ou Medium)

### 5. Regressão obrigatória (pós-sync/pull)

Após qualquer `git pull` e após `npm run cap:sync`:

1. Abra no Xcode e confirme os targets **App** e **WeDietWidget**
2. No target **App**, confirme a fase **Embed App Extensions** com `WeDietWidget.appex`
3. Rode build em iPhone físico
4. Adicione o widget na Home e valide atualização de calorias/macros/hidratação
5. Faça novo `git pull` e confirme que o target continua presente

### 6. Dados

O widget lê dados de `UserDefaults(suiteName: "group.app.dietainteligente")` com a chave `"widgetData"`. O app principal salva esses dados automaticamente sempre que as refeições ou metas mudam.

## Estrutura do JSON salvo

```json
{
  "caloriesTarget": 2000,
  "caloriesConsumed": 1250,
  "caloriesRemaining": 750,
  "proteinsTarget": 150,
  "proteinsConsumed": 85,
  "carbsTarget": 250,
  "carbsConsumed": 160,
  "fatsTarget": 65,
  "fatsConsumed": 40,
  "mealsCount": 3,
  "hydrationMl": 1200,
  "hydrationTarget": 2000,
  "lastUpdate": "2026-04-01T12:00:00.000Z"
}
```
