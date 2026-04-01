

## Plano: Proteger project.pbxproj durante cap sync

### Problema

O `npx cap sync` pode sobrescrever o `project.pbxproj`, removendo referências customizadas (plugins nativos, entitlements, capabilities, build settings como DEVELOPMENT_TEAM, MARKETING_VERSION, etc.). Além disso, `SharedDataPlugin.m` e `SharedDataPlugin.swift` existem no diretório mas **não estão referenciados** no pbxproj atual.

### Solução

Criar um shell script wrapper (`scripts/cap-sync.sh`) que:

1. Faz backup do `project.pbxproj` antes de rodar `cap sync`
2. Executa `npx cap sync`
3. Restaura o backup do `project.pbxproj` (preservando todos os targets, referências e build settings customizados)
4. Roda `pod install` para garantir que os pods estejam sincronizados

### Alterações

**1. Criar `scripts/cap-sync.sh`**

Script bash que:
- Copia `ios/App/App.xcodeproj/project.pbxproj` para `ios/App/App.xcodeproj/project.pbxproj.bak`
- Executa `npx cap sync ios`
- Restaura o backup sobre o pbxproj gerado pelo cap sync
- Executa `cd ios/App && pod install`
- Remove o backup
- Exibe mensagem de sucesso

**2. Adicionar referências do SharedDataPlugin ao `project.pbxproj`**

Os arquivos `SharedDataPlugin.m` e `SharedDataPlugin.swift` existem no diretório mas não estão no pbxproj. Adicionar:
- PBXFileReference para ambos os arquivos
- Entradas no grupo App (PBXGroup)
- PBXBuildFile entries na seção Sources

**3. Adicionar script npm ao `package.json`**

Adicionar um script `"cap:sync": "bash scripts/cap-sync.sh"` para facilitar o uso via `npm run cap:sync`.

### Detalhes técnicos

O script preserva **todo** o pbxproj customizado (entitlements separados Debug/Release, DEVELOPMENT_TEAM, MARKETING_VERSION, CURRENT_PROJECT_VERSION, bridging header, plugins nativos). O `cap sync` atualiza apenas os web assets (`public/`) e o `capacitor.config.json` dentro do diretório iOS -- essas atualizações **não dependem** do pbxproj, então restaurar o backup é seguro.

O `pod install` no final garante que qualquer novo plugin adicionado ao `package.json` tenha seu pod instalado corretamente, mesmo com o pbxproj preservado.

