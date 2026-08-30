# ECCD SmartTrack

A classroom management system for Early Childhood Care and Development (ECCD) centers, with separate portals for teachers/admins and parents.

## Tech Stack

- **React 19** + **Vite** — UI and build tooling
- **React Router v7** — routing, role-based route guards
- **Tailwind CSS v4** — styling
- **React Hook Form** + **Zod** — form handling and validation
- **TanStack React Query** — data fetching, caching, and request deduplication
- **lucide-react** — icons

## Features

**Teacher / Admin portal** (`/dashboard`, `/attendance`, `/student-info`, `/learning-materials`, `/event-photos`, `/calendar`, `/accounts-management`, `/settings`)
- Dashboard with attendance stats, today's present list, daily theme, and upcoming birthdays
- Attendance tracking with CSV export
- Student roster with profiles, guardians, medical notes, and documents
- Learning materials with student-work submission review
- Event photo albums
- Event calendar
- Account management (Admin/Teacher roles)

**Parent portal** (`/parent/dashboard`, `/parent/studentprofile`, `/parent/attendance`, `/parent/materials`, `/parent/photo-gallery`, `/parent/settings`)
- Per-child dashboard and progress
- Attendance calendar and recent logs
- Materials with submission upload
- Photo gallery filtered to the parent's linked child(ren)

Roles are defined in `src/auth/roles.js`: `Admin`, `Teacher`, `Parent`, `Guardian`. Route access is enforced via `ProtectedRoute` in `TeacherRoutes.jsx` / `ParentRoutes.jsx`.

## Backend Status: Mock Fallback

**The backend is still in development.** Every data hook in this app tries the real API first, then falls back to local mock data (from `src/data/mock*.js`) if the request fails — so the UI stays usable while backend endpoints are being built out.

This is implemented via a single shared helper, `withMockFallback()` in `src/api/mockFallback.js`. Every call site is tagged with a `// MOCK_FALLBACK` comment.

**To remove the mock layer once the backend is complete:**
1. `grep -rn "MOCK_FALLBACK" src` to find every call site.
2. Replace each `withMockFallback(() => apiClient.x(...), mockValue)` call with a plain `await apiClient.x(...)`.
3. Delete `src/api/mockFallback.js` and the `src/data/mock*.js` files.
4. Delete `src/data/mockSubmissionsStore.js` (used similarly, for student-work submissions) once `apiClient.submitStudentWork`/`getSubmissions` are backed by a real store.

Some `apiClient` endpoints (`getChildAttendance`, `getChildProgress`, `getChildren`, `getEvents`, `getDashboardStats`, `getDailyTheme` in `src/api/client.js`) are **speculative** — their URL shape hasn't been confirmed against a real backend contract yet. Adjust them once the actual API is defined.

## Project Structure

```
src/
├── api/            # apiClient (fetch wrapper) + mockFallback helper
├── assets/
├── auth/           # roles, auth context
├── components/     # shared UI (ui/, shared/, navigation/)
├── config/         # env-driven config (API base URL)
├── constants/
├── context/        # ParentChildContext, AuthContext
├── data/           # mock*.js — fallback data only, not a real data layer
├── features/       # feature-based modules (attendance, students, materials,
│                     eventPhotos, dashboard), each with components/hooks/utils
├── hooks/           # cross-cutting hooks (useAuth, useDebounce, usePagination...)
├── layouts/         # Layout, ParentLayout
├── pages/           # route-level page components
├── routes/          # AppRoutes, TeacherRoutes, ParentRoutes
├── utils/
└── validation/       # Zod schemas
```

Data-fetching hooks follow a consistent pattern: a `use<Thing>Query()` hook wraps `useQuery` (React Query) and `withMockFallback`; hooks that need local mutations (e.g. `useMaterials`, `useAlbumsState`) sync the query result into local mutable state once, then mutate locally since there's no real write endpoint yet.