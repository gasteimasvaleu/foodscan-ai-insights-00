

## Plano: Posicionar toasts ainda mais abaixo

### Alteração em `src/components/ui/toast.tsx` (linha 17)

Aumentar o offset de `1rem` para `3.5rem`:

**De:** `top-[calc(env(safe-area-inset-top)+1rem)]`
**Para:** `top-[calc(env(safe-area-inset-top)+3.5rem)]`

Isso empurra os toasts ~40px mais para baixo, garantindo distância confortável da barra de status e indicadores do dispositivo.

