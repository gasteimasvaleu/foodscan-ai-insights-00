
Objetivo: corrigir o novo erro do AppFlow no archive iOS removendo a inconsistência entre o projeto Xcode e os arquivos reais do Capacitor.

Diagnóstico
- O problema anterior de dependências foi resolvido: o log mostra `dependency_install` concluído e o AppFlow já encontra `ios/App/App.xcodeproj`.
- O erro atual acontece dentro do Xcode archive.
- O `project.pbxproj` ainda referencia estes recursos dentro de `ios/App/App/`:
  - `public`
  - `config.xml`
  - `capacitor.config.json`
- Mas, no repositório atual, `ios/App/App/` não contém esses arquivos. Hoje essa pasta só tem arquivos Swift, plist, storyboards e assets.
- Por isso o Xcode falha com `lstat(.../ios/App/App/public): No such file or directory`.

O que isso significa
- Não é erro de `Podfile`.
- Não é erro de AppFlow buscar a pasta errada.
- É um projeto iOS desincronizado: o Xcode espera arquivos gerados do Capacitor que não estão versionados no repo.

Evidências encontradas
- `ios/App/App.xcodeproj/project.pbxproj` inclui:
  - `public in Resources`
  - `config.xml in Resources`
  - `capacitor.config.json in Resources`
- `ios/.gitignore` ignora justamente:
  - `App/App/public`
  - `App/App/config.xml`
  - `App/App/capacitor.config.json`

Plano de correção
1. Ajustar o projeto Xcode para não depender desses arquivos ausentes no git.
2. Remover do `ios/App/App.xcodeproj/project.pbxproj` as referências de:
   - `public`
   - `config.xml`
   - `capacitor.config.json`
   na seção de file references, group children e resources build phase.
3. Manter apenas os recursos nativos reais que já existem no repo, como:
   - `Assets.xcassets`
   - `LaunchScreen.storyboard`
   - `Main.storyboard`
   - `Info.plist`
4. Revisar se o projeto continua apontando corretamente para:
   - `App/Info.plist`
   - `App/App-Bridging-Header.h`
   - pods e workspace
5. Depois disso, rodar novo build no AppFlow.

Resultado esperado
- O Xcode deixa de tentar copiar arquivos inexistentes.
- O archive iOS avança além da fase `CpResource`.
- Se aparecer um próximo erro, ele tende a ser de assinatura, assets, native code ou configuração de release — não mais dessa inconsistência estrutural.

Detalhes técnicos
```text
Causa raiz:
project.pbxproj -> Resources Build Phase
                 -> aponta para arquivos gerados do Capacitor
                 -> arquivos não existem em ios/App/App/
                 -> archive falha com lstat no Xcode
```

Arquivos a alterar
- `ios/App/App.xcodeproj/project.pbxproj`

Observação importante
- Esse tipo de problema costuma acontecer quando os arquivos nativos foram gerados localmente em algum momento, mas não foram sincronizados/commitados, enquanto o `.xcodeproj` continuou apontando para eles.
- Depois da correção, se você também for mexer em partes nativas do app, o fluxo ideal continua sendo: fazer pull do projeto e rodar `npx cap sync` localmente para manter o projeto nativo consistente.

Sugestões relevantes para depois
- Validar o archive iOS no AppFlow novamente.
- Se o build passar dessa etapa, revisar versionamento iOS (`MARKETING_VERSION` e `CURRENT_PROJECT_VERSION`).
- Confirmar se ícone/splash estão corretos para App Store.
