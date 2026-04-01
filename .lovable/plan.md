

## Adicionar `import WidgetKit` ao SharedDataPlugin.swift

### Problema
O arquivo `SharedDataPlugin.swift` no repositório GitHub não tem o `import WidgetKit`, causando o erro `cannot find 'WidgetCenter' in scope` no build do Appflow.

### Alteração
**`ios/App/App/SharedDataPlugin.swift`** — Adicionar `import WidgetKit` na linha 2, após `import Foundation`:

```swift
import Foundation
import WidgetKit
import Capacitor
```

Isso é tudo que precisa ser feito — uma linha adicionada.

