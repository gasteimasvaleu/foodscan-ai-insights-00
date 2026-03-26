

## O que você precisa fazer (passo a passo)

Eu vou fazer as mudanças nos arquivos do projeto aqui no Lovable (config do Capacitor e troca do plugin Vite). Depois disso, você faz o resto no terminal do Mac.

### Parte 1 — Eu faço aqui no Lovable
- Atualizar `capacitor.config.ts` com `packageManager: 'cocoapods'`
- Trocar `@vitejs/plugin-react-swc` por `@vitejs/plugin-react` no `vite.config.ts` e `package.json`

### Parte 2 — Você faz no terminal do Mac

```bash
cd /Users/caioroberto/Desktop/foodscan-ai-insights-00
git pull
npm install
npm run build
npx cap sync ios
```

Depois desse `cap sync`, o Capacitor vai **gerar a pasta `ios/` com o Podfile** automaticamente (porque a config agora força CocoaPods).

Depois:

```bash
pod install --project-directory=ios/App
```

### Parte 3 — Editar o Podfile gerado

Abrir o arquivo `ios/App/Podfile` num editor de texto e adicionar esse bloco dentro do `post_install`:

```ruby
installer.pods_project.targets.each do |target|
  target.build_configurations.each do |config|
    config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
    config.build_settings['CODE_SIGNING_REQUIRED'] = 'NO'
    config.build_settings['CODE_SIGN_IDENTITY'] = ''
  end
end
```

### Parte 4 — Restaurar arquivos nativos do Apple Sign In

Copiar os arquivos de `ios-native-backup/` para `ios/App/App/`:
- `AppDelegate.swift`
- `MyViewController.swift`
- `NativeAppleSignInPlugin.swift`
- `NativeAppleSignInPlugin.m`
- `App-Bridging-Header.h`
- `App.entitlements`

### Parte 5 — Commitar a pasta iOS

```bash
git add ios/
git commit -m "Add iOS CocoaPods platform"
git push
```

### Parte 6 — No dashboard do Appflow

- **Remover** variáveis: `GYM_XCARGS` e `ENABLE_SPM_SUPPORT`
- **Manter**: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

---

Aprovo fazer a Parte 1 agora?

