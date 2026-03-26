

## Plano: Posicionar toasts abaixo da status bar no app nativo

### Alteração em `src/components/ui/toast.tsx`

Na linha 17, o `ToastViewport` usa `top-0`. Vamos trocar para usar `top-[calc(env(safe-area-inset-top)+1rem)]` para que os toasts apareçam abaixo da área do notch/status bar em dispositivos nativos.

**De:**
```
"fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
```

**Para:**
```
"fixed top-[calc(env(safe-area-inset-top)+1rem)] z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
```

Isso garante que em dispositivos com notch ou barra de status, o toast fique posicionado abaixo dela. Na web sem safe-area, `env(safe-area-inset-top)` resolve para `0px`, então o toast ficará a `1rem` do topo — comportamento normal.

