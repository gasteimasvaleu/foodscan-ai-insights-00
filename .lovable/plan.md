

## Problema

O `package.json` tem **duas** dependências de plugin React:
- `@vitejs/plugin-react@^6.0.1` (em dependencies) — requer Vite 8, incompatível
- `@vitejs/plugin-react-swc@^4.3.0` (em devDependencies) — compatível com Vite 5

O `vite.config.ts` já usa `plugin-react-swc`. Só preciso **remover** o `@vitejs/plugin-react` do `package.json`.

## Mudança

**`package.json`** — remover a linha `"@vitejs/plugin-react": "^6.0.1"` das dependencies.

Depois disso, no terminal:

```bash
npm install
npm run build
rm -rf ios
npx cap add ios --packagemanager cocoapods
ls ios/App/Podfile
```

