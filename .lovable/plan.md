

## Simplificar card de boas-vindas no AuthCard

### Alteração em `src/components/AuthCard.tsx` (linhas 83-107)

Substituir o bloco do usuário logado por um card simples com apenas o texto de boas-vindas em uma linha, fonte menor:

```tsx
if (user) {
  const userName = user.user_metadata?.name || user.email;
  return (
    <>
      <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-800 text-sm truncate text-center">
            Boas-vindas, {userName}!
          </h3>
        </CardContent>
      </Card>
      <PushNotificationSetup ref={pushNotificationRef} />
    </>
  );
}
```

- Remove "Usuário logado" text
- Remove botão "Sair"
- Reduz padding de `p-6` para `p-4`
- Reduz fonte para `text-sm` com `truncate` para caber em uma linha

