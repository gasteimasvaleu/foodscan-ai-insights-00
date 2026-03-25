

## Plan: Apply glassmorphism modal style across all dialogs

Apply the same styling from the "Editar Perfil" modal to every `DialogContent` and `AlertDialogContent` in the project.

**Reference style:** `w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl`

### Files to update

**1. `src/pages/Profile.tsx` (line 603)** — Calculadora de TMB dialog
- Add glassmorphism classes to `<DialogContent>`

**2. `src/pages/PhysicalAssessment.tsx` (line 192)** — Nova Avaliação dialog
- Replace current classes, keep `max-w-2xl max-h-[90vh] overflow-y-auto`, add glassmorphism + rounded + border

**3. `src/pages/MyDiets.tsx` (line 195)** — Adicionar Alimento dialog
- Add glassmorphism classes to `<DialogContent>`

**4. `src/pages/AdminTreinos.tsx` (line 288)** — Add/Edit workout dialog
- Replace current classes, keep `max-w-2xl max-h-[90vh] overflow-y-auto`, add glassmorphism + rounded + border

**5. `src/pages/AdminTreinos.tsx` (line 559)** — Delete confirmation AlertDialog
- Add glassmorphism classes to `<AlertDialogContent>`

**6. `src/components/VideoModal.tsx` (line 56)** — Video player dialog
- Keep `max-w-4xl w-full h-[80vh] flex flex-col`, add glassmorphism + rounded + border

All modals will receive: `rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl` plus `w-[calc(100%-2rem)]` for horizontal spacing on mobile.

