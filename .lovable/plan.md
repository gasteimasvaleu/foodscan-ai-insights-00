

## Alterar cor da Navbar e Tubelight para #DB2174

### Alterações

**1. `src/components/Navbar.tsx`** (linha 33)
- Trocar `bg-white/80` por `bg-[#DB2174]/85 backdrop-blur-md` — mantém efeito vidro com a nova cor
- Atualizar textos para branco (logo, "MEU PERFIL")

**2. `src/components/ui/tubelight-navbar.tsx`** (linha 48)
- Trocar `bg-background/80 border border-border` por `bg-[#DB2174]/85 border border-white/20` — mesma cor com efeito vidro
- Atualizar cores do texto e ícones para branco
- Adicionar faixa decorativa atrás do menu (div absoluto com `bg-[#DB2174]/40` e blur, mais largo que o menu)

