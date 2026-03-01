# AGENTS.md

## Project Overview
- Name: BLIH HR Portal
- App: `apps/web`
- Framework: Next.js (App Router) + TypeScript
- Styling: Tailwind CSS
- UI primitives: shadcn/ui wrappers from `@/shared/components/ui/*`
- Charts: Recharts (client components only)
- Icons: lucide-react
- Package manager: npm workspaces

## Monorepo Structure
- Web app: `apps/web`
- Shared types/package: `packages/types` (if used)
- HR features: `apps/web/src/features/hr/*`
- Routes: `apps/web/src/app/dashboard/hr/*`

## Path & Import Conventions
- Use alias imports like `@/features/...`, `@/shared/...`
- Keep feature-local imports inside each feature folder
- Export component barrels via local `components/index.ts` when pattern already exists

## Frontend Architecture Rules
- Keep pages thin: route files only do auth/role guard + render feature content
- Put UI + view logic in `features/*`
- Use mock data + `types.ts` per feature until API integration
- Reuse existing shared cards/components before creating new ones
- Prefer data-driven rendering (map over arrays) over hardcoded repeated JSX

## shadcn/ui Usage Rules
- Prefer shadcn components for interactive primitives:
  - `Button`, `Tabs`, `Table`, `Select`, `Dialog`, etc.
- Avoid raw `<button>`, `<select>`, `<input>` unless truly necessary
- Keep variants/sizing consistent with existing patterns in recruitment pages

## Next.js Rules
- Use Server Components by default
- Add `"use client"` only when needed (`useState`, handlers, browser APIs, Recharts)
- Recharts must be rendered in client components
- Keep auth checks in route `page.tsx` files:
  - `getSession()`
  - `isAuthorizedForDashboard(...)`
  - redirect when unauthorized

## Styling Rules
- Follow existing spacing/typography rhythm used in HR pages
- Reuse existing color tokens/classes (`primary`, grays, borders)
- Match Figma closely; avoid introducing new visual language
- Desktop-first layouts should remain responsive

## Code Quality Rules
- TypeScript strict: no `any` unless unavoidable
- Keep components focused and small
- Name files by responsibility (`mock-data.ts`, `types.ts`, `index.tsx`)
- Run before commit:
  - `npm run lint --workspace web`
  - `npm run check-types --workspace web`

## Git & Commit Rules
- Conventional prefix: `feat(web):...`, `fix(web):...`, `revert(web):...`
- One logical change per commit
- Don’t include unrelated file changes

## AI Assistant Do/Don’t
- Do: inspect similar existing pages/components before implementing new ones
- Do: reuse established patterns from recruitment/onboarding modules
- Don’t: introduce new libraries without explicit request
- Don’t: change global architecture for local UI tasks
