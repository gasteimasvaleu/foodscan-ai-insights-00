

## Fix: "NativeAppleSignIn plugin is not implemented on ios"

### Causa raiz

O `AppDelegate.swift` (linha 9-11) usa o view controller padrão do Capacitor:

```swift
func application(...) -> Bool {
    return true  // ← usa CAPBridgeViewController padrão
}
```

O plugin é registrado em `MyViewController.swift` via `bridge?.registerPluginInstance(NativeAppleSignInPlugin())`, mas esse controller **nunca é instanciado** porque o AppDelegate não o utiliza.

O arquivo `AppDelegate 2.swift` tem a versão correta que cria `MyViewController()` manualmente, mas o arquivo principal `AppDelegate.swift` foi sobrescrito (provavelmente por um `npx cap sync`).

### Correção

**`ios/App/App/AppDelegate.swift`** — substituir `didFinishLaunchingWithOptions` para instanciar `MyViewController`:

```swift
func application(_ application: UIApplication, 
                 didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    let vc = MyViewController()
    window = UIWindow(frame: UIScreen.main.bounds)
    window?.rootViewController = vc
    window?.makeKeyAndVisible()
    return true
}
```

### Ação necessária após deploy

Após a alteração, no terminal local:
1. `git pull`
2. `npx cap sync ios`
3. Rebuild no Xcode e testar no device

### Arquivo editado
| Arquivo | Mudança |
|---|---|
| `ios/App/App/AppDelegate.swift` | Usar `MyViewController` como root view controller |

