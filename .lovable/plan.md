

## Correção rápida: remover @capacitor/app

### O que muda
- Remove `@capacitor/app` do `package.json`
- Simplifica `src/main.tsx` para fazer sync apenas no startup (sem listener de resume)
- O `autoUpdateMethod: 'background'` no `capacitor.config.ts` já cuida de sync automático em background

### Arquivos alterados

**1. `src/main.tsx`**
- Remover import de `@capacitor/app`
- Remover o listener de `resume`
- Manter apenas o sync no startup com `liveUpdateSync()`

**2. `package.json`**
- Remover `@capacitor/app` das dependencies

**3. `package-lock.json`**
- Regenerar sem `@capacitor/app` (lockfile volta a ficar em sync)

### Resultado
- Build do Appflow passa sem erro de lockfile
- Live Updates continua funcionando (sync no startup + auto background sync)
- A única diferença: não há re-check explícito no resume, mas o plugin já faz isso via `autoUpdateMethod: 'background'`

