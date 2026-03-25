

## Adicionar texto informativo acima do botão "Assinar via App Store"

No fluxo nativo iOS do `AuthCard.tsx`, adicionar o texto "Caso ainda não tenha assinatura, clique antes em:" logo acima do botão "Assinar via App Store".

### Alteração

**`src/components/AuthCard.tsx`** — No bloco nativo iOS (ainda a ser implementado), incluir um `<p>` com o texto antes do botão de assinatura:

```tsx
<p className="text-sm text-gray-600 text-center">
  Caso ainda não tenha assinatura, clique antes em:
</p>
<Button onClick={handlePurchase}>
  Assinar via App Store
</Button>
```

Isso será incluído na implementação do plano anterior (refatoração do AuthCard com fluxo nativo/web).

