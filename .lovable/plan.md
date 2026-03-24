

## Separar banner e boas-vindas em dois cards distintos

### Alteração em `src/components/AuthCard.tsx` (linhas 83-101)

Separar o card atual em dois cards: um só com a imagem e outro só com o texto.

```tsx
return (
  <>
    <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl overflow-hidden">
      <div className="aspect-video w-full">
        <img
          src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/bannerapp2.png"
          alt="Banner"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </Card>
    <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground text-sm truncate text-center">
          Boas-vindas, {userName}!
        </h3>
      </CardContent>
    </Card>
    <PushNotificationSetup ref={pushNotificationRef} />
  </>
);
```

