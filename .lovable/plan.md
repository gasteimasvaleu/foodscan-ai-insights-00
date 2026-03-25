

## Fix: "Editar Metas" button navigating to wrong route

The button navigates to `/daily-control` but the route is registered as `/controle-diario`.

### Change

**`src/pages/Profile.tsx`** (line 732):
- Change `navigate("/daily-control")` to `navigate("/controle-diario")`

