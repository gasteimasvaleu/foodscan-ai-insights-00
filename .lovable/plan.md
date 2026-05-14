## Objetivo
Adicionar a feature **Desafio 14 dias** (do repo `gasteimasvaleu/meu-desafio-saude`) na rota `/desafio-14-dias` do We Diet, **gratuita** (sem `ProRoute`), reusando os vídeos hospedados no bucket público do projeto Supabase original.

## Decisões confirmadas
- **Acesso**: gratuito para qualquer usuário logado (sem `ProRoute`).
- **Vídeos**: manter URLs absolutas que vêm do repo original (bucket público do outro projeto Supabase).
- **Entrada**: botão no Menu Mais (Plus) da TubelightNavbar.

## Banco de dados (1 migration)
Criar tabelas com prefixo `challenge_` para não colidir com nomes do We Diet:
- `challenge_user_profile` (gender, age, initial_weight, body_photo_url, face_photo_url, motivation)
- `challenge_progress` (current_day, start_date, is_completed)
- `challenge_completed_days` (day_number)
- `challenge_daily_checklist` (day_number, followed_menu, drank_water, walked, slept_well, mood, symptoms[], notes)
- `challenge_weight_logs` (day_number, weight)
- `challenge_progress_photos` (day_number, photo_type, photo_url, notes)
- Bucket `challenge-photos` (público) para fotos de progresso, com policies por `auth.uid()::text = (storage.foldername(name))[1]`.
- RLS por `auth.uid() = user_id` em todas as tabelas. FKs com `ON DELETE CASCADE` para `auth.users`.
- Triggers `BEFORE UPDATE` reusando a função existente `public.update_updated_at_column()`.

## Frontend
- Nova página `src/pages/Desafio14Dias.tsx` orquestrando: `Onboarding` (se não houver `challenge_user_profile`) → `Dashboard` (lista 14 dias) → `DayView` (checklist + peso + foto + humor).
- Componentes em `src/components/desafio14/`: `Onboarding`, `Dashboard`, `DayCard`, `DayView`, `ChecklistItem`, `MoodSelector`, `SymptomChecker`, `DailyNotes`, `WeightInput`, `WeightChart`, `AddProgressPhoto`, `PhotoGallery`, `PhotoTimeline`, `PhotoComparison`, `ShareTransformation`, `StreakCounter`, `AchievementBadge`, `ProgressBar`, `MotivationalButton`, `MenuCard`, `CompletionScreen` — copiados do repo, só ajustando imports e cores.
- Hooks em `src/hooks/desafio14/`: `useChallengeState`, `useUserProfile`, `useWeightTracker`, `useProgressPhotos`, `useShareTransformation`, `useDailyMotivation` — adaptados para usar o cliente Supabase do We Diet (`@/integrations/supabase/client`) e o `useAuth` existente.
- Conteúdo dos cardápios + URLs dos vídeos (do bucket público do projeto antigo) preservados como estão.
- Rota em `src/App.tsx`: `<Route path="/desafio-14-dias" element={<Desafio14Dias />} />` — sem `ProRoute`.
- Entrada no Menu Mais: adicionar item "Desafio 14 dias" (ícone `Trophy`) no componente do hub do botão `+` (mesmo lugar onde Quiz, Conquistas etc. aparecem).

## Visual (We Diet)
- Wrapper padrão: `<Navbar />` + `min-h-screen bg-background pb-32` + container `container max-w-lg mx-auto px-4 pt-[calc(env(safe-area-inset-top)+4rem)] space-y-4`.
- Cards: `bg-[#FFD1E7] rounded-3xl`, títulos `text-base` sem ícones decorativos.
- Modais glassmorphism `bg-white/70 backdrop-blur-md`, botão fechar `bg-[#FD46A1]` branco.
- Destaques rosa `#FD46A1`, inputs `text-base` (anti-zoom iOS).
- Toasts via `sonner`.

## Edge function
- `supabase/functions/desafio14-daily-motivation/index.ts` portando `daily-motivation` do repo, mas usando **Lovable AI Gateway** (`LOVABLE_API_KEY` já existe) com modelo `google/gemini-2.5-flash` e `corsHeaders` importado de `npm:@supabase/supabase-js@2/cors`. (Se a mensagem motivacional for opcional, posso pular essa edge function — me avisa.)

## Que NÃO traremos
- `Auth.tsx`, `Index.tsx`, `App.tsx`, `InstallPWAModal`, `NavLink`, `VideoPlayer`, sistema `access_tokens`, `hotmart-webhook` do repo (We Diet já tem tudo).
- Tabela `user_profiles` (conflitaria com `profiles` do We Diet — por isso renomeada para `challenge_user_profile`).

## Verificação
- Build automático.
- `/desafio-14-dias` mostra Navbar + onboarding na 1ª visita; após onboarding mostra dashboard com 14 cards (dia 1 desbloqueado).
- Checklist do dia 1 → desbloqueia dia 2, soma streak, salva no Supabase.
- Upload de foto vai para bucket `challenge-photos`; vídeos abrem via URL pública do projeto antigo.
- Testar em viewport 390px (iPhone) com safe-area.
