

## Corrigir package-lock.json desatualizado

O problema: o projeto usa Bun localmente (gerando `bun.lock`), mas o AppFlow roda `npm ci` que depende do `package-lock.json`. Quando adicionamos `@capacitor/live-updates`, o `bun.lock` foi atualizado mas o `package-lock.json` não.

### Solução

**Regenerar o `package-lock.json`** executando `npm install` no ambiente do projeto para que o lockfile reflita todas as dependências atuais, incluindo `@capacitor/live-updates@0.5.0`.

Isso será feito via `code--exec` rodando `npm install --package-lock-only` para atualizar apenas o lockfile sem alterar `node_modules`.

### Resultado esperado

O `package-lock.json` incluirá `@capacitor/live-updates` e o `npm ci` do AppFlow passará sem erros.

