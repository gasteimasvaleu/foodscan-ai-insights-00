

## Plan: Hide Navbar and Tubelight Menu When User is Not Logged In

### Problem
The Navbar (top) and TubelightNavbar (bottom menu) are always visible, including on the login form. They should only appear when the user is authenticated.

### Approach

**1. `src/App.tsx`** — Conditionally render `TubelightNavbar`
- Import `useAuth` and wrap the component to only show when `user` exists
- Since `useAuth` uses hooks, convert `App` from arrow const to a component that can use hooks inside `BrowserRouter`

**2. `src/components/Navbar.tsx`** — Hide when not logged in
- The Navbar is rendered inside individual pages (Index, Auth, etc.)
- Option A: Add `useAuth` check inside Navbar to return `null` when no user
- Option B: Remove `<Navbar />` from pages that show to unauthenticated users

Best approach: **Option A** — inside Navbar, if no `user`, return `null`. This way all pages automatically hide it for unauthenticated users.

**3. `src/pages/Index.tsx`** — Adjust padding
- When Navbar is hidden, the top padding (`pt-[calc(env(safe-area-inset-top)+2.5rem)]`) needs to be conditional or reduced since there's no navbar taking space.

### Files to modify
1. **`src/components/Navbar.tsx`** — Return `null` if `!user`
2. **`src/App.tsx`** — Wrap TubelightNavbar in a component that checks auth, only render when user exists
3. **`src/pages/Index.tsx`** — Adjust top padding to be conditional based on auth state

