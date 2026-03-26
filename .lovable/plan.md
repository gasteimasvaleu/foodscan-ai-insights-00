
Problema principal: o AppFlow está falhando antes mesmo de chegar no build iOS porque o `npm ci` não consegue instalar as dependências. Pelo código atual, o `package.json` já contém `@capacitor/live-updates`, mas o `package-lock.json` ainda não contém essa dependência. Por isso o erro:

```text
Missing: @capacitor/live-updates@0.5.0 from lock file
```

O erro de TypeScript no `capacitor.config.ts` é consequência disso: como o `npm ci` falha, o ambiente não instala `typescript`, então o AppFlow não consegue ler o arquivo `capacitor.config.ts`.

O que vou ajustar:
1. Sincronizar o `package-lock.json` com o `package.json`, garantindo que `@capacitor/live-updates@0.5.0` apareça no lockfile.
2. Conferir se o lockfile passa a refletir também as dependências já existentes, incluindo `typescript`.
3. Corrigir a inconsistência de App ID do Live Updates, porque hoje há um desencontro:
   - `appflow.config.json` usa `f4605189`
   - `capacitor.config.ts` usa `d8f89897`
   
   Isso pode não causar este erro atual, mas pode impedir o OTA de funcionar corretamente depois.

Arquivos envolvidos:
- `package-lock.json` — regenerar/sincronizar
- `capacitor.config.ts` — alinhar o `LiveUpdates.appId` com o AppFlow
- validação cruzada com `package.json` e `appflow.config.json`

Resultado esperado após implementar:
- `npm ci` volta a funcionar no AppFlow
- o AppFlow consegue instalar TypeScript e ler `capacitor.config.ts`
- o build iOS deixa de falhar nessa etapa inicial
- o Live Updates fica consistente com o App ID correto do AppFlow

Detalhe técnico:
```text
Estado atual:
package.json          -> tem @capacitor/live-updates
package-lock.json     -> não tem @capacitor/live-updates
npm ci                -> falha
typescript            -> não instala
capacitor.config.ts   -> não pode ser lido

Após correção:
package.json          -> sincronizado
package-lock.json     -> sincronizado
npm ci                -> ok
typescript            -> instalado
capacitor.config.ts   -> lido normalmente
```
