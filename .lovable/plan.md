

## Re-apply glassmorphism styling to VideoModal.tsx and AdminTreinos.tsx

Restore the same glassmorphism modal style used across the app to the two previously reverted files.

### Changes

**1. `src/components/VideoModal.tsx`** (line 56)
- Change `DialogContent` classes to: `max-w-4xl w-[calc(100%-2rem)] h-[80vh] flex flex-col rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl`

**2. `src/pages/AdminTreinos.tsx`** — Two locations:
- Workout dialog (~line 288): Change `DialogContent` to: `w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl`
- Delete AlertDialog (~line 559): Change `AlertDialogContent` to: `w-[calc(100%-2rem)] rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl`

