
Corrigir o build do Appflow atualizando de fato o `package-lock.json`, porque o problema ainda está no repositório.

### O que eu confirmei
- `package.json` já contém:
  - `@capgo/capacitor-health`
  - `react-markdown`
  - `typescript`
- `package-lock.json` não está sincronizado:
  - no bloco raiz dele faltam `@capgo/capacitor-health` e `react-markdown`
  - por isso o `npm ci` quebra antes mesmo de instalar dependências
- O erro de Capacitor/TypeScript é consequência disso:
  - como o `npm ci` falha, o Appflow não instala o CLI nem o TypeScript
  - depois o passo `create_capacitor_config` também falha

### Plano de implementação
1. Regenerar o `package-lock.json` corretamente a partir do `package.json`
   - usar `npm install` ou `npm install --package-lock-only`
   - objetivo: fazer o lockfile incluir `@capgo/capacitor-health`, `react-markdown` e toda a árvore transitiva

2. Validar o lockfile sincronizado
   - conferir que `package-lock.json` passa a listar esses pacotes no bloco raiz e em `packages/node_modules/...`
   - garantir que o arquivo atualizado seja commitado, não só o `bun.lock`

3. Revisar o fluxo de build do Appflow
   - manter `dependencyInstallCommand: "npm ci && npm run build && npx cap sync ios"` em `appflow.config.json`
   - não mudar isso agora, porque o comando está correto; o problema é o lockfile

4. Fazer novo build no Appflow
   - com o lockfile correto, o `npm ci` deve concluir
   - isso também deve destravar a leitura do `capacitor.config.ts`, porque o TypeScript e o Capacitor CLI finalmente serão instalados

### Observação importante
Na tentativa anterior, o resumo dizia que `package-lock.json` tinha sido atualizado, mas pelos arquivos atuais isso não aconteceu. O repositório ainda está com o lockfile antigo. Então o próximo passo não é “tentar outra configuração do Appflow”, e sim atualizar e versionar o `package-lock.json` de verdade.

### Arquivos envolvidos
- `package-lock.json` — precisa ser regenerado e commitado
- `package.json` — já está correto, apenas conferir consistência
- `appflow.config.json` — manter como está

### Resultado esperado
Depois dessa correção, o erro principal de `npm ci` deve desaparecer. Se surgir um erro novo após isso, aí sim ele será o próximo erro real do pipeline, em vez deste bloqueio inicial de lockfile.
