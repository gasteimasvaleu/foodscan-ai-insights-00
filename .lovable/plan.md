

## Corrigir sincronização do package-lock.json

**Problema:** O `@capacitor/app@8.1.0` foi adicionado ao `package.json` mas o `package-lock.json` não foi regenerado. O Appflow roda `npm ci` que falha quando há inconsistência.

**Solução:** Regenerar o `package-lock.json` executando `npm install --package-lock-only` no ambiente do projeto.

### Passo único

Executar o comando para regenerar o lockfile:
```bash
npm install --package-lock-only
```

Isso vai adicionar `@capacitor/app@8.1.0` ao `package-lock.json` sem alterar nenhum outro arquivo.

