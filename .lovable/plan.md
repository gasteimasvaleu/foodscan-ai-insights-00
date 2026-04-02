

## Página Dedicada ao Sono — Registro Manual + Lembretes

### O que será construído
Página `/sono` com registro manual de sono, avaliação de qualidade, histórico semanal e estatísticas. Design seguindo o padrão existente do app (header com gradiente rosa, ícones brancos, estrutura igual ao Jejum Intermitente).

### Alterações

**1. Migration SQL — tabela `sleep_records`**
- Campos: `id`, `user_id`, `sleep_date`, `bedtime` (timestamptz), `wake_time` (timestamptz), `duration_minutes`, `quality_rating` (1-5), `tags` (text[]), `notes`, `created_at`
- RLS: usuário só acessa seus próprios registros

**2. Atualizar tipos Supabase** (`src/integrations/supabase/types.ts`)
- Adicionar tipagem da nova tabela `sleep_records`

**3. Criar `src/pages/Sleep.tsx`**
- Header padrão do app: gradiente `from-primary/20 via-primary/25 to-primary/30`, ícone `Moon` em box gradiente, título rosa `#FD46A1`
- Padding top: `pt-[calc(env(safe-area-inset-top)+4rem)]`
- Card de registro via Drawer com WheelPicker para horário de dormir/acordar
- Avaliação de qualidade (1-5 estrelas) + tags opcionais
- Card de resumo diário (horas dormidas, qualidade, horários)
- Gráfico semanal de barras (Recharts)
- Card de estatísticas (média, streak, consistência)
- Histórico dos últimos registros
- WhatsAppNotice, Navbar, AuthCard — mesmo padrão das outras páginas

**4. Registrar rota** (`src/App.tsx`)
- Adicionar `import Sleep` e `<Route path="/sono" element={<Sleep />} />`

**5. Adicionar ao menu "+"** (`src/components/ui/tubelight-navbar.tsx`)
- Novo item em `moreSheetItems`:
  ```
  { name: "Sono", description: "Registre e acompanhe a qualidade do sono", url: "/sono", icon: Moon }
  ```
- Importar `Moon` do lucide-react

