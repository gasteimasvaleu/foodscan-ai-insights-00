

## Esconder Navbar durante o VideoOverlay

### Problema
A Navbar tem `z-50` (mesmo nível do VideoOverlay), então aparece por cima do vídeo.

### Solução
Aumentar o `z-index` do VideoOverlay de `z-50` para `z-[60]` em `src/components/VideoOverlay.tsx`. Isso garante que o overlay fique acima da navbar sem precisar alterar nenhum outro componente.

### Mudança
- **`src/components/VideoOverlay.tsx`**: Trocar `className="fixed inset-0 z-50"` por `className="fixed inset-0 z-[60]"`

