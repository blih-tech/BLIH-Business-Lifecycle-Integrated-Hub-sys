# Role-Based Dashboard Routing Plan (Next.js App Router)

Summary  
Role-aware routing after sign-in. Users are redirected to a dedicated dashboard route based on highest-priority role. Each dashboard route enforces access on the server and renders the correct UI for that role.

Scope and Decisions (Locked)

- Routing model: Dedicated routes per dashboard.
- Paths: /dashboard/<role> (e.g., /dashboard/hr, /dashboard/finance).
- Root behavior: / redirects authenticated users to their role dashboard.
- Multi-role policy: Fixed priority order.
- Priority order: superadmin > hr > finance > pm > crm > brain.
- Access enforcement: Server-enforced (server components + redirects).

Implementation Details

1. Add Role to Route Mapping
   Create a shared mapping so routing is consistent everywhere.

- File: apps/web/src/shared/constants/roles.ts
- Add ROLE_DASHBOARD_PATHS map:
- superadmin -> /dashboard/superadmin
- hr -> /dashboard/hr
- finance -> /dashboard/finance
- project_manager -> /dashboard/pm
- crm_manager -> /dashboard/crm
- brain_operator -> /dashboard/brain
- Add ROLE_PRIORITY array in the same file, in the chosen order.

2. Add Primary Role Resolver
   Create a small helper to compute a user's primary role.

- File: apps/web/src/shared/auth/role-routing.ts (or apps/web/src/shared/constants/roles.ts if you want it co-located)
- getPrimaryRole(roles: Role[]): Role | null
- Implementation: iterate ROLE_PRIORITY, return first matching role.
- getDashboardPath(roles: Role[]): string | null using ROLE_DASHBOARD_PATHS.

3. Route Structure
   Create a dedicated dashboard section.

- New route: apps/web/src/app/dashboard/page.tsx
- Server component.
- Calls getSession() (existing API or local server fetch).
- If unauthenticated: redirect /auth/signin.
- If authenticated: redirect to getDashboardPath(roles).

- New role pages:
- apps/web/src/app/dashboard/superadmin/page.tsx
- apps/web/src/app/dashboard/hr/page.tsx
- apps/web/src/app/dashboard/finance/page.tsx
- apps/web/src/app/dashboard/pm/page.tsx
- apps/web/src/app/dashboard/crm/page.tsx
- apps/web/src/app/dashboard/brain/page.tsx
- Each page server-checks roles and redirects to /dashboard (or /auth/signin) if user lacks role.

4. Root / Behavior
   Replace current home behavior with role-based redirect.

- apps/web/src/app/page.tsx
- If authenticated: redirect to /dashboard.
- If not authenticated: either redirect to /auth/signin or show a lightweight public landing.

5. Session Fetching Strategy (Server-Side)
   Keep it server-first and consistent.

- Reuse GET /api/auth/session for server components, or
- Extract a server-only getSessionFromCookies() helper to avoid fetch overhead.

If you keep the API fetch, ensure:

- Server components call with cache: no-store and forward cookies.

API and Interface Changes

- New exports:
- ROLE_DASHBOARD_PATHS
- ROLE_PRIORITY
- getPrimaryRole(roles: Role[]): Role | null
- getDashboardPath(roles: Role[]): string | null

Edge Cases and Behavior

- Multiple roles: Redirect to highest priority.
- No recognized roles: Redirect to /auth/signin?error=role_missing or /dashboard with a friendly no-access screen.
- Unauthenticated: Always redirect to /auth/signin.

Test Scenarios

1. Signed in with superadmin -> /dashboard/superadmin.
2. Signed in with hr_manager only -> /dashboard/hr.
3. Signed in with finance_manager and pm_lead -> /dashboard/finance.
4. Signed in with no recognized role -> redirect to no-access outcome.
5. Unauthenticated user hits /dashboard/hr -> redirected to /auth/signin.

Assumptions and Defaults

- /dashboard/<role> routes are canonical.
- Access enforced server-side using redirects.
- project_manager maps to /dashboard/pm, crm_manager to /dashboard/crm, brain_operator to /dashboard/brain.
