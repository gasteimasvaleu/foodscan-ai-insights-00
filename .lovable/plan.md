

## Alterar o Build Number do Projeto iOS

O `CURRENT_PROJECT_VERSION` está definido como `1` em ambas as configurações (Debug e Release) no arquivo `project.pbxproj`.

### O que será feito

Alterar o valor de `CURRENT_PROJECT_VERSION` de `1` para `2` nas duas configurações (Debug e Release) no arquivo `ios/App/App.xcodeproj/project.pbxproj` (linhas 375 e 400).

A `MARKETING_VERSION` (1.0) permanece a mesma -- apenas o build number muda.

### Depois do deploy

Cada vez que fizer um novo build pro AppFlow/App Store, será necessário incrementar esse número (3, 4, 5...).

