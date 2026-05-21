## Corrigir "Invalid input" ao salvar perfil

### Causa raiz
Em `src/components/profile/EditProfileDialog.tsx` (linhas 30–38), o schema Zod dos campos opcionais (`bio`, `email_public`, `phone`, `address`, `city`, `state`) é:

```
z.string().trim().email(...).max(255).optional().or(z.literal(""))
```

Isso aceita apenas `string`, `undefined` ou `""`, mas **não aceita `null`**. Os dados vindos do Supabase chegam como `null` (e o `initial` é tipado como `string | null`). Resultado: ao abrir o modal e clicar em "Salvar Alterações" sem editar esses campos, o Zod falha e dispara o toast com a mensagem padrão "Invalid input".

### Correção
Tornar todos os campos opcionais do schema `nullable`, aceitando `null` além de `""`/`undefined`:

```ts
const schema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(50),
  bio: z.string().trim().max(160, "Máx. 160 caracteres").nullable().optional(),
  email_public: z.union([
    z.string().trim().email("Email inválido").max(255),
    z.literal(""),
    z.null(),
  ]).optional(),
  phone: z.string().trim().max(20).nullable().optional().or(z.literal("")),
  address: z.string().trim().max(200).nullable().optional().or(z.literal("")),
  city: z.string().trim().max(80).nullable().optional().or(z.literal("")),
  state: z.string().trim().max(40).nullable().optional().or(z.literal("")),
});
```

(O cuidado especial com `email_public` é porque `.email()` rejeita `""`; mantemos a união explícita com `z.literal("")` e `z.null()`.)

### Fora de escopo
Sem alterações em DB, RLS, payload de update ou layout do modal.
