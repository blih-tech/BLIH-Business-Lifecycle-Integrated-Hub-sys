# Hostinger Production Deployment (API + Keycloak)

This directory contains the production deployment artifacts used by GitHub Actions for Hostinger VPS releases.

## What gets deployed

- `api` container image from GHCR
- `keycloak` container image from GHCR
- No PostgreSQL service in this compose file
- No MailHog service in this compose file

PostgreSQL is expected to run separately on the same VPS or another reachable host.

## Required server files

On the VPS deployment directory (`$HOSTINGER_DEPLOY_PATH`), keep:

- `docker-compose.prod.yml`
- `deploy.sh`
- `healthcheck.sh`
- `.env.production` (not committed; managed server-side)

Use `.env.production.example` as the template for `.env.production`.

## Required GitHub Secrets

- `HOSTINGER_SSH_HOST`
- `HOSTINGER_SSH_PORT`
- `HOSTINGER_SSH_USER`
- `HOSTINGER_SSH_KEY`
- `HOSTINGER_DEPLOY_PATH`
- `GHCR_PULL_USERNAME`
- `GHCR_PULL_TOKEN`

## Deployment flow

1. GitHub Action builds and pushes:
   - `ghcr.io/<owner>/blih-api-runtime:<sha>`
   - `ghcr.io/<owner>/blih-api-migrator:<sha>`
   - `ghcr.io/<owner>/blih-keycloak:<sha>`
2. Workflow syncs this folder to the VPS.
3. Workflow runs `deploy.sh` remotely.
4. `deploy.sh`:
   - Logs into GHCR
   - Pulls target images
   - Runs Prisma migrations with migrator image
   - Runs `docker compose up -d`
   - Executes `healthcheck.sh`
   - Updates release marker files
   - Auto-rolls back to previous release if checks fail

## Release markers

- `current-release.env` stores active image tags.
- `previous-release.env` stores the last known-good release for rollback.
