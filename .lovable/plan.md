

## Remover Footer do app

Remover o componente `Footer` de todas as páginas onde é usado e deletar o arquivo do componente.

### Páginas que importam e usam `<Footer />`:
- `src/pages/Index.tsx`
- `src/pages/FitTracker.tsx`
- `src/pages/PaymentSuccess.tsx`
- `src/pages/PaymentCancel.tsx`
- `src/pages/WhatsAppSettings.tsx`

Além dessas, preciso verificar outras páginas.

### Ações:
1. Remover `import { Footer }` e `<Footer />` de todas as páginas que o utilizam
2. Deletar `src/components/Footer.tsx`

