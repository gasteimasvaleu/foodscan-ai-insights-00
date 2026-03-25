

## Reduzir padding lateral das páginas de Política e Termos

As duas páginas usam `px-4` (16px cada lado) no container externo, o que em 390px de viewport espreme os cards.

### Alterações

**`src/pages/PrivacyPolicy.tsx` e `src/pages/TermsOfUse.tsx`**:
- Trocar `px-4` por `px-2` no div wrapper externo
- Isso libera 8px a mais de cada lado para o conteúdo dos cards

