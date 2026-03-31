
Sim — para o projeto funcionar, **não há necessidade** desses arquivos `.p8` no repositório.

Eles são credenciais privadas da Apple e devem ficar apenas no ambiente seguro (Apple/Appflow/Secrets), não versionados no Git.

Plano curto e seguro:
1. Remover do repositório:
   - `AuthKey_662LGDFC77.p8`
   - `AuthKey_RQYNV768ZD.p8`
2. Bloquear recorrência no `.gitignore` com `*.p8`.
3. Limpar histórico do Git para apagar essas chaves antigas dos commits.
4. Validar login Apple após a limpeza (o fluxo nativo continua, pois não depende de arquivo `.p8` local no app).

Resumo objetivo: manter `.p8` no repo só aumenta risco de segurança e **não é necessário** para runtime do app.
