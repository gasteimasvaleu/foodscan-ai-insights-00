

# Transformar We Diet em App Nativo com Capacitor + Apple Sign In

## O que vamos fazer

Configurar o projeto We Diet para rodar como app nativo iOS/Android usando **Capacitor**, e adicionar suporte a **Sign in with Apple** nativo no iOS usando os arquivos Swift do seu repositório.

## Etapas

### 1. Instalar dependencias do Capacitor

Adicionar ao `package.json`:
- `@capacitor/core`
- `@capacitor/cli` (dev)
- `@capacitor/ios`
- `@capacitor/android`

### 2. Criar arquivo de configuracao `capacitor.config.ts`

```text
appId:   app.lovable.7af51b51f57a4397be1bb371107e8a01
appName: We Diet
webDir:  dist
server.url: https://7af51b51-f57a-4397-be1b-b371107e8a01.lovableproject.com?forceHideBadge=true
server.cleartext: true
```

### 3. Copiar arquivos nativos iOS para o projeto

Criar pasta `ios-native-backup/` na raiz com os 6 arquivos do repositorio:
- `AppDelegate.swift` - Usa MyViewController customizado
- `MyViewController.swift` - Registra plugin NativeAppleSignIn
- `NativeAppleSignInPlugin.swift` - Plugin nativo de Apple Sign In
- `NativeAppleSignInPlugin.m` - Bridge Objective-C
- `App-Bridging-Header.h` - Header de bridging
- `App.entitlements` - Entitlements com Sign in with Apple

### 4. Criar plugin TypeScript para Apple Sign In

Criar `src/plugins/NativeAppleSignIn.ts` que faz a ponte entre o JavaScript e o plugin nativo Swift via `Capacitor.registerPlugin`.

### 5. Adicionar botao "Entrar com Apple" na tela de Auth

Modificar `src/pages/Auth.tsx` e `src/components/AuthCard.tsx`:
- Detectar se esta rodando no Capacitor nativo (`Capacitor.isNativePlatform()`)
- Se sim, mostrar botao "Entrar com Apple"
- Ao clicar, chamar o plugin nativo que retorna `identityToken`
- Usar `supabase.auth.signInWithIdToken({ provider: 'apple', token: identityToken })` para autenticar

### 6. Adicionar hook `useNativePlatform`

Um hook simples que detecta se o app esta rodando como nativo (Capacitor) ou web.

---

## Passos que voce fara localmente (apos as mudancas no Lovable)

1. Exportar projeto para GitHub (ou git pull se ja conectado)
2. `npm install`
3. `npx cap add ios`
4. `npx cap update ios`
5. Copiar os arquivos de `ios-native-backup/` para `ios/App/App/`
6. Abrir `ios/App/App.xcworkspace` no Xcode
7. Arrastar os arquivos Swift/m/h para o target App no Xcode
8. Em Signing & Capabilities, adicionar "Sign in with Apple"
9. Atualizar o Bundle ID conforme necessario
10. `npm run build && npx cap sync`
11. `npx cap run ios`

Para mais detalhes, leia: https://docs.lovable.dev/tips-tricks/mobile-development

