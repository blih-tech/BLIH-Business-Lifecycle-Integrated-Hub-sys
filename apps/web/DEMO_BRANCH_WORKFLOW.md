# Demo Branch Workflow (Web)

## Branch Naming
- Current demo branch: `demo/hr-showcase`
- This is acceptable for most conventions because it is scoped and descriptive.
- If your org enforces a stricter pattern, align to that exact rule from `CONTRIBUTING.md` or repo policy.

Common valid patterns:
- `demo/<scope>`
- `feat/<scope>`
- `feature/<scope>`
- `chore/<scope>`

## Recommended Strategy
1. Keep `demo/hr-showcase` focused on demo-only behavior (demo auth, temporary UX shortcuts, deploy flags).
2. Keep product/UI implementation work in separate feature branches.
3. Rebase or merge latest `main` into both active branches regularly.
4. When you want a fresh demo with latest UI:
   - merge selected feature branches into `demo/hr-showcase`
   - deploy `demo/hr-showcase` to Vercel
5. Avoid mixing unrelated tasks in the demo branch.

## Practical Flow
1. Create feature branch:
   - `git checkout main`
   - `git pull`
   - `git checkout -b feat/hr-people-form-updates`
2. Build and commit feature work.
3. Open PR from feature branch to org repo.
4. Update demo branch with needed work:
   - `git checkout demo/hr-showcase`
   - `git pull`
   - `git merge feat/hr-people-form-updates`
5. Deploy demo branch on Vercel.

## Deployment Notes (Demo)
- Set `DEMO_MODE=true` in Vercel env vars for the demo deployment.
- Use `apps/web` as the root directory in Vercel project settings.
- Share only demo URL for stakeholder review.

## Cleanup After Demo
1. Remove or disable demo deployment.
2. Remove demo-only env vars if no longer needed.
3. Delete demo branch when done:
   - `git branch -d demo/hr-showcase`
   - `git push <remote> --delete demo/hr-showcase`
