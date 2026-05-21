## Bump de versão iOS para envio à Apple

**Alvo:** `ios/App/App.xcodeproj/project.pbxproj`

- `MARKETING_VERSION`: `1.0.8` → `1.0.9` (em todas as ocorrências: Debug + Release do target App e do WeDietWidget, se houver)
- `CURRENT_PROJECT_VERSION`: `22` → `23` (idem)

**Pós-bump:**
- Não rodar `npx cap sync` (poderia mexer no pbxproj). A edição é só nos build settings de versão.
- Usuário faz pull no Mac e faz Archive no Xcode (ou sobe via Appflow) para enviar pra Apple.
