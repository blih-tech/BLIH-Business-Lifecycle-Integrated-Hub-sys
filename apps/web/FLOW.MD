# Keycloak OIDC Login Flow with Origin-Preserving Redirects

This diagram illustrates the complete login flow for a Next.js frontend, NestJS backend, and Keycloak authentication, including transient cookies, backend code exchange, and origin-preserving redirects.

```mermaid
flowchart TD
    %% =========================
    %% Step 1: User initiates login
    %% =========================
    A[Browser: User clicks "Login"] --> B[Frontend (Next.js): GET /api/v1/auth/login?redirect=/dashboard]

    %% =========================
    %% Step 2: Frontend sends request to backend
    %% =========================
    B --> C[NestJS Backend: AuthController.login()]
    C --> D[Generate OIDC request: state, codeVerifier, nonce, frontendOrigin, redirectPath]
    D --> E[Set transient HttpOnly cookies:
          - kc_state
          - kc_verifier
          - kc_nonce
          - kc_redirect
          - kc_frontend_origin]

    %% =========================
    %% Step 3: Backend redirects to Keycloak login page
    %% =========================
    E --> F[Backend 302 Redirect → Keycloak /authorize?client_id=...&state=...&code_challenge=...]

    %% =========================
    %% Step 4: User interacts with Keycloak
    %% =========================
    F --> G[Browser: Keycloak Login Page (user enters credentials)]

    %% =========================
    %% Step 5: Keycloak redirects back to backend callback
    %% =========================
    G --> H[Keycloak 302 Redirect → /api/v1/auth/callback?code=XYZ&state=ABC]

    %% =========================
    %% Step 6: Backend processes callback
    %% =========================
    H --> I[NestJS: AuthController.callback()]
    I --> J[Read transient cookies: kc_state, kc_verifier, kc_nonce, kc_redirect, kc_frontend_origin]
    J --> K{Validate state & nonce}
    K -->|Invalid| L[Clear transient cookies & redirect to /login?error=invalid_state]
    K -->|Valid| M[Exchange code for tokens via KeycloakTokenService]
    M --> N[Set auth HttpOnly cookies: kc_access, kc_refresh, kc_id, kc_csrf]
    N --> O[Clear transient cookies: kc_state, kc_verifier, kc_nonce, kc_redirect]

    %% =========================
    %% Step 7: Origin-preserving redirect to frontend
    %% =========================
    O --> P{Check kc_frontend_origin}
    P -->|localhost| Q[302 Redirect → http://localhost + kc_redirect (/dashboard)]
    P -->|example.com| R[302 Redirect → https://example.com + kc_redirect (/dashboard)]
    P -->|other/invalid| S[302 Redirect → fallback safe URL (/dashboard)]

    %% =========================
    %% Step 8: User lands on frontend dashboard
    %% =========================
    Q --> T[Browser receives redirect → Frontend Dashboard]
    R --> T
    S --> T
```
