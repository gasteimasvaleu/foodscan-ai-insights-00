

## Plano: Tela dedicada do Widget + Modal na primeira refeição

### O que será feito

1. **Tela dedicada "Widget iOS"** — acessível pelo menu do Perfil, com tutorial passo a passo de como adicionar o widget na Home Screen (com ícones ilustrativos e texto em português)

2. **Modal automático na primeira refeição** — após o usuário registrar a primeira refeição, exibe um modal (glassmorphism, padrão do app) explicando que existe um widget disponível, com botão para ir à tela dedicada ou dispensar. Usa `localStorage` para mostrar só uma vez.

3. **Link no Perfil** — adicionar um item no menu do Perfil que leva à tela do Widget (visível apenas em iOS)

---

### Detalhes técnicos

**Novo arquivo: `src/pages/WidgetGuide.tsx`**
- Tela com Navbar, título "Widget iOS"
- 3 passos visuais com ícones (Smartphone, Plus, Layout): segurar tela → buscar "Dieta Inteligente" → escolher tamanho
- Card com preview descritivo do widget (calorias, macros, hidratação)
- Estilo consistente com o app

**Novo arquivo: `src/components/WidgetPromoModal.tsx`**
- Dialog com glassmorphism (`bg-white/70 backdrop-blur-md border-2 border-primary`)
- Imagem/ícone do widget, texto curto explicando a funcionalidade
- Botões: "Ver como adicionar" (navega para `/widget-guide`) e "Depois"
- Só aparece em iOS (check via Capacitor) e apenas 1x (flag `widget_promo_shown` no localStorage)

**Alteração: `src/pages/DailyControl.tsx`**
- Importar `WidgetPromoModal`
- Mostrar modal quando `meals.length === 1` e a flag não estiver setada

**Alteração: `src/pages/Profile.tsx`**
- Adicionar botão/link "Widget iOS" que navega para `/widget-guide` (visível apenas em iOS)

**Alteração: `src/App.tsx`**
- Adicionar rota `/widget-guide` → `WidgetGuide`

