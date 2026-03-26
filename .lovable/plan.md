
Problema confirmado: o erro continua porque o `package-lock.json` do repositório ainda está dessincronizado.

O que eu verifiquei no código:
- `package.json` já tem `@capacitor/app` em `dependencies`
- `src/main.tsx` já importa `@capacitor/app`
- `appflow.config.json` roda `npm ci && npm run build && npx cap sync ios`
- `package-lock.json` ainda não contém `@capacitor/app` nem a entrada `node_modules/@capacitor/app`

Ou seja, o Appflow está correto ao falhar: o lockfile commitado ainda não foi atualizado de verdade no projeto.

Plano de correção:
1. Regenerar o `package-lock.json` localmente com npm para incluir `@capacitor/app`
   - usar `npm install --package-lock-only`
   - isso precisa alterar o arquivo versionado `package-lock.json`

2. Confirmar no lockfile estas duas coisas
   - `@capacitor/app` dentro do bloco raiz `packages[""].dependencies`
   - uma entrada `node_modules/@capacitor/app`

3. Commitar e enviar esse `package-lock.json` atualizado
   - sem isso, o Appflow continuará usando o lockfile antigo e `npm ci` continuará quebrando

4. Rodar novo build no Appflow
   - após o lockfile entrar no repositório, o erro de `npm ci` deve sumir
   - os erros de Capacitor/TypeScript devem desaparecer junto, porque eram consequência da instalação abortada

Se ainda falhar depois disso, eu revisaria em seguida:
- se o branch enviado ao Appflow é o mesmo branch onde o lockfile foi atualizado
- se existe mais de um lockfile sendo considerado
- se o build está usando cache antigo

Arquivos envolvidos:
- `package.json`
- `package-lock.json`
- `src/main.tsx`
- `appflow.config.json`

Detalhe técnico importante:
o projeto usa Bun no desenvolvimento, mas o Appflow usa `npm ci`. Então não basta atualizar `bun.lock`; o `package-lock.json` precisa estar sincronizado e commitado.

Resultado esperado:
- `npm ci` instala normalmente
- `npm run build` executa
- `npx cap sync ios` consegue ler o `capacitor.config.ts`
- o build do Appflow segue para o teste do Live Update
