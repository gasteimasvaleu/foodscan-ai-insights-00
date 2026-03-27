

## Adicionar Card de Lembretes na página de Perfil

### Visao geral
Criar um card "Lembretes" abaixo do card "Acoes Rapidas" com o mesmo design (bg-[#FFD1E7], rounded-3xl, shadow-xl). O card tera botoes para adicionar e visualizar lembretes, com modais seguindo o padrao glassmorphism do app.

### 1. Criar tabela `reminders` no Supabase

```sql
CREATE TABLE public.reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  reminder_type text NOT NULL, -- 'dieta', 'atividade_fisica', 'bem_estar', 'personalizado'
  reminder_date date NOT NULL,
  reminder_time time NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders" ON public.reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reminders" ON public.reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminders" ON public.reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reminders" ON public.reminders FOR DELETE USING (auth.uid() = user_id);
```

### 2. Criar componente `RemindersCard.tsx`

Novo componente em `src/components/RemindersCard.tsx` contendo:

- **Card** com design identico ao "Acoes Rapidas" (bg-[#FFD1E7], rounded-3xl, shadow-xl)
- Icone de Bell (lucide) rosa
- **Botao "Adicionar Lembrete"** que abre modal de criacao
- **Botao "Visualizar Lembretes"** (visivel apenas quando ha lembretes cadastrados) que abre modal de listagem

**Modal Adicionar Lembrete** (padrao glassmorphism: w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl):
- Select com tipos de lembrete:
  - Beber agua
  - Tomar suplemento
  - Hora da refeicao
  - Treino / Exercicio
  - Alongamento
  - Meditacao / Relaxamento
  - Pesar-se
  - Personalizado (exibe input de titulo livre)
- Calendar (Shadcn DatePicker) para selecionar dia
- Input de hora (type="time")
- Input de descricao opcional
- Botao Salvar

**Modal Visualizar Lembretes**:
- Lista dos lembretes com tipo, data, hora
- Botao de deletar em cada item

### 3. Integrar na pagina Profile

Importar `RemindersCard` e inserir logo apos o card "Acoes Rapidas" (linha ~245 do Profile.tsx), passando `user.id`.

### Arquivos
- **Nova migration SQL** - tabela reminders + RLS
- **Novo arquivo**: `src/components/RemindersCard.tsx`
- **Editado**: `src/pages/Profile.tsx` (import + renderizacao do componente)

