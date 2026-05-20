## Igualar header do Mercado Fácil ao da WeDiet

O usuário está se referindo ao header superior rosa do Mercado Fácil (`MFHeader`), que aparece mais "grosso" que a navbar superior da WeDiet (`Navbar`).

### Diferenças atuais

| | WeDiet `Navbar` | Mercado Fácil `MFHeader` |
|---|---|---|
| Altura | `h-12` (48px) | `h-14` (56px) |
| Padding lateral | `container mx-auto px-4` | `px-3` |
| Safe area top | `pt-[calc(env(safe-area-inset-top)*0.6)]` | `paddingTop: env(safe-area-inset-top)` |
| Cor de fundo | `bg-[#FA1690]/85` + `backdrop-blur-md` | `bg-[#FD46A1]` sólido |

### Mudança

Em `src/components/mercado-facil/MFHeader.tsx`:

1. Trocar `h-14` por `h-12` na barra interna para igualar a altura da WeDiet.
2. Trocar `px-3` por `container mx-auto px-4` para alinhar com a largura/padding internos.
3. Ajustar o `paddingTop` do safe area para `calc(env(safe-area-inset-top)*0.6)`, igual à WeDiet (deixa o header mais compacto em iOS).
4. Manter cor `#FD46A1` (identidade do Mercado Fácil) — não muda para rosa da WeDiet.
5. Reduzir os botões redondos de voltar/carrinho de `w-10 h-10` para `w-9 h-9` (e ícones de 26/22 → 22/20) para caberem bem em 48px de altura.

Resultado: header do Mercado Fácil com mesma altura e padding interno do header da WeDiet, mantendo a cor rosa sólida e o ícone de carrinho.
