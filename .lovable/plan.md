

## Mover página Gráficos e Progresso para rota independente e adicionar ao menu +

### Mudanças

**1. `src/App.tsx`** — Alterar rota de `/profile/graficos` para `/graficos-progresso`

**2. `src/components/ui/tubelight-navbar.tsx`** — Adicionar item ao `moreSheetItems`:
```ts
{
  name: "Gráficos e Progresso",
  description: "Acompanhe sua evolução",
  url: "/graficos-progresso",
  icon: BarChart3,
}
```

**3. `src/pages/Profile.tsx`** — Atualizar o link do card de ação rápida de `/profile/graficos` para `/graficos-progresso`

**4. `src/pages/ChartsProgress.tsx`** — Remover o botão "voltar ao perfil" (ArrowLeft) já que a página agora é independente, manter a Navbar

