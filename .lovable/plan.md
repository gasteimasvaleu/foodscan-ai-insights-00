

## Substituir ServiNUTRI por botão "+" com Bottom Sheet no Tubelight Menu

### O que muda

O item "ServiNUTRI" (ícone Apple) no menu inferior será substituído por um botão "+" (Plus) que abre um bottom sheet com links para páginas extras, começando pelo ServiNUTRI.

### Mudanças

**1. `src/App.tsx`**
- Remover `ServiNUTRI` do array `navItems`
- Remover import do ícone `Apple`
- Adicionar import de `Plus` do lucide-react
- Adicionar o item "Mais" com ícone `Plus` e url especial (ex: `#more`)

**2. `src/components/ui/tubelight-navbar.tsx`**
- Adicionar estado `moreSheetOpen` para controlar o bottom sheet
- Detectar clique no item "Mais" (url `#more`) — em vez de navegar, abrir o sheet
- Renderizar um `<Sheet>` com `<SheetContent side="bottom">` estilizado com as cores do app:
  - `rounded-t-2xl max-h-[85vh] overflow-y-auto`
  - Fundo com glassmorphism (`bg-white/95 backdrop-blur-xl`)
  - Handle visual no topo (barrinha cinza)
- Dentro do sheet, listar os itens extras como cards clicáveis:
  - **ServiNUTRI** (ícone Apple/Stethoscope, cor primária)
  - Espaço para futuras páginas
- Cada card navega para a rota correspondente e fecha o sheet
- Estilo dos cards: fundo rosa claro, ícone em círculo com cor primária, texto em negrito

### Visual do Bottom Sheet

```text
┌─────────────────────────────┐
│          ── (handle) ──     │
│                             │
│  ┌─────────────────────┐    │
│  │ 🩺  ServiNUTRI      │→   │
│  │     Rede de nutri.. │    │
│  └─────────────────────┘    │
│                             │
│  (futuras páginas aqui)     │
│                             │
└─────────────────────────────┘
```

### Detalhes técnicos
- Imports necessários: `Sheet, SheetContent` de `@/components/ui/sheet`, `useNavigate` de react-router-dom, `Plus` e `Stethoscope` de lucide-react
- O item "Mais" não terá o efeito "lamp" ativo (não é uma rota real)
- O sheet segue o padrão de cores do app: bordas `border-[#FA1690]/20`, ícones em `#FD46A1`

