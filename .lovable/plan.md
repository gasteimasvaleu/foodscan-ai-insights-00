

## Corrigir build do Appflow — mudar `npm ci` para `npm install`

### Diagnóstico

O `package-lock.json` no repositório continua desatualizado — faltam `@capgo/capacitor-health`, `react-markdown` e ~80 dependências transitivas. Apesar de múltiplas tentativas de regenerar o lockfile via `npm install --package-lock-only`, o arquivo no repo **não foi atualizado**. Isso acontece porque o sandbox do Lovable usa **bun** como runtime, e os comandos npm não persistem corretamente o `package-lock.json` no repositório git.

### Solução

Alterar o comando de instalação no `appflow.config.json` de `npm ci` para `npm install`:

- `npm ci` exige lockfile perfeitamente sincronizado (falha se qualquer pacote estiver faltando)
- `npm install` lê o `package.json`, instala tudo e atualiza o lockfile automaticamente

### Alteração

**`appflow.config.json`** — uma linha:
```
"dependencyInstallCommand": "npm install && npm run build && npx cap sync ios"
```

### Por que isso resolve

1. O Appflow roda `npm install` → instala todas as deps do `package.json` incluindo `@capgo/capacitor-health` e `react-markdown`
2. TypeScript é instalado → `capacitor.config.ts` pode ser lido
3. Capacitor CLI é instalado → `npx cap sync ios` funciona
4. Build prossegue normalmente

### Trade-off

`npm install` é ligeiramente menos determinístico que `npm ci` (pode resolver versões diferentes se os ranges mudarem), mas é a solução correta enquanto o ambiente de desenvolvimento usa bun e não consegue manter o `package-lock.json` sincronizado de forma confiável.

