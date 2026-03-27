

## Remover imports não utilizados de useNativePlatform

### Alterações

**`src/components/Navbar.tsx`**
- Remover import de `useNativePlatform` (linha 10)
- Remover import de `useIsMobile` (linha 5)
- Remover variáveis `isMobile`, `isIOS`, `isNative`, `isNativeIOS` (linhas 14, 17-18)

**`src/components/SubscriptionRequired.tsx`**
- Remover import de `useNativePlatform` (linha 7)
- Remover variáveis `isIOS`, `isNative`, `isNativeIOS` (linhas 16-17)

Nenhuma dessas variáveis é referenciada no restante dos arquivos.

