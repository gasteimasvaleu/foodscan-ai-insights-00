

## Sincronizar package-lock.json

### Problema
O Appflow usa `npm ci` que exige `package-lock.json` perfeitamente sincronizado com `package.json`. Pacotes adicionados recentemente (`@capgo/capacitor-health`, `react-markdown`) não estão no lockfile.

### Solução
Regenerar o `package-lock.json` executando `npm install --package-lock-only` no ambiente do projeto. Isso atualiza o lockfile sem alterar nenhum código.

### Passos
1. Executar `npm install --package-lock-only` para gerar um `package-lock.json` atualizado
2. Verificar que o arquivo foi gerado corretamente

### Resultado
Após o commit, o próximo build no Appflow com `npm ci` vai funcionar sem erros de dependências faltantes.

