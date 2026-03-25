

## Ajuste fino da safe area superior

Trocar o multiplicador de `0.5` para `0.6` no padding-top da Navbar:

**`src/components/Navbar.tsx`**:
- `pt-[calc(env(safe-area-inset-top)*0.5)]` → `pt-[calc(env(safe-area-inset-top)*0.6)]`

Isso adiciona ~5px a mais que a metade, sem voltar ao excesso anterior.

