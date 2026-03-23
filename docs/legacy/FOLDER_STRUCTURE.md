# BLIH Full Scope Folder Structure

This document defines the complete monorepo folder structure for the BLIH (Business Lifecycle Integrated Hub) system.

## Overview

```
blih-system/
├── .github/                    # CI/CD workflows
├── apps/                       # Application services
├── packages/                   # Shared packages & modules
├── infrastructure/             # Docker, K8s, Terraform
├── docs/                       # Documentation
├── scripts/                    # Automation scripts
├── tests/                      # Test suites
└── tools/                      # Development tools
```

---

## Root Level Structure

```
blih-system/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # Main CI pipeline
│   │   ├── deploy-staging.yml  # Staging deployment
│   │   ├── deploy-prod.yml     # Production deployment
│   │   └── security-scan.yml   # Security checks
│   ├── CODEOWNERS              # Code ownership
│   └── PULL_REQUEST_TEMPLATE.md
│
├── apps/
│   ├── web/                    # Next.js frontend (main)
│   ├── api/                    # NestJS API gateway
│   └── rag-service/            # RAG AI service
│
├── packages/
│   ├── core-platform/          # Core services (auth, audit, events)
│   ├── module-hr/              # HR Module
│   ├── module-crm/             # CRM Module
│   ├── module-projects/        # Projects Module
│   ├── module-finance/         # Finance Module
│   ├── module-brain/           # Knowledge & AI Module
│   ├── module-compliance/      # Risk/CAPA/Review Module
│   ├── shared/
│   │   ├── types/              # Shared TypeScript types
│   │   ├── ui/                 # Shared UI components
│   │   ├── utils/              # Utility functions
│   │   ├── config/             # Shared configuration
│   │   └── constants/          # Shared constants
│   └── config/
│       ├── eslint-config/      # ESLint configurations
│       ├── ts-config/          # TypeScript configurations
│       └── tailwind-config/    # Tailwind configurations
│
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   ├── terraform/
│   └── nginx/
│
├── docs/
│   ├── api/                    # API documentation
│   ├── architecture/           # Architecture diagrams
│   ├── deployment/             # Deployment guides
│   └── compliance/             # Compliance documentation
│
├── scripts/
│   ├── setup.sh
│   ├── backup.sh
│   ├── deploy.sh
│   └── maintenance.sh
│
├── tests/
│   ├── e2e/                    # End-to-end tests
│   ├── integration/            # Integration tests
│   ├── load/                   # Load tests
│   └── security/               # Security tests
│
├── tools/
│   ├── generators/             # Code generators
│   └── migrations/             # Database migration tools
│
├── .env.example
├── .gitignore
├── .dockerignore
├── docker-compose.yml
├── docker-compose.prod.yml
├── docker-compose.override.yml
├── Makefile
├── package.json                # Root workspace config
├── pnpm-workspace.yaml         # PNPM workspace config
├── turbo.json                  # Turbo repo config
└── README.md
```

---

## Apps Directory

### apps/web/ - Main Frontend

```
apps/web/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth group (no layout)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/            # Dashboard group
│   │   ├── layout.tsx          # Dashboard layout
│   │   ├── page.tsx            # Dashboard home
│   │   ├── settings/
│   │   │   ├── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   └── security/
│   │   │       └── page.tsx
│   │   │
│   │   ├── hr/                 # HR Module routes
│   │   │   ├── page.tsx
│   │   │   ├── employees/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   ├── contracts/
│   │   │   │   └── page.tsx
│   │   │   ├── departments/
│   │   │   │   └── page.tsx
│   │   │   └── onboarding/
│   │   │       └── page.tsx
│   │   │
│   │   ├── crm/                # CRM Module routes
│   │   │   ├── page.tsx
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── deals/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── pipeline/
│   │   │   │       └── page.tsx
│   │   │   ├── contacts/
│   │   │   │   └── page.tsx
│   │   │   └── organizations/
│   │   │       └── page.tsx
│   │   │
│   │   ├── projects/           # Projects Module routes
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── tasks/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── time/
│   │   │   │       └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   │
│   │   ├── finance/            # Finance Module routes
│   │   │   ├── page.tsx
│   │   │   ├── invoices/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── payroll/
│   │   │   │   └── page.tsx
│   │   │   ├── expenses/
│   │   │   │   └── page.tsx
│   │   │   ├── accounts/
│   │   │   │   └── page.tsx
│   │   │   └── reports/
│   │   │       ├── pnl/
│   │   │       │   └── page.tsx
│   │   │       └── balance-sheet/
│   │   │           └── page.tsx
│   │   │
│   │   ├── brain/              # Brain Module routes
│   │   │   ├── page.tsx
│   │   │   ├── policies/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── decisions/
│   │   │   │   └── page.tsx
│   │   │   ├── lessons/
│   │   │   │   └── page.tsx
│   │   │   ├── search/
│   │   │   │   └── page.tsx
│   │   │   └── chat/
│   │   │       └── page.tsx
│   │   │
│   │   └── compliance/         # Compliance Module routes
│   │       ├── page.tsx
│   │       ├── risks/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       ├── capa/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       └── reviews/
│   │           └── page.tsx
│   │
│   ├── api/                    # API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── upload/
│   │   │   └── route.ts
│   │   └── proxy/
│   │       └── [...path]/
│   │           └── route.ts
│   │
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── loading.tsx             # Global loading
│   ├── error.tsx               # Global error
│   └── globals.css
│
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── navigation.tsx
│   │   ├── breadcrumbs.tsx
│   │   └── mobile-nav.tsx
│   │
│   ├── common/
│   │   ├── data-table/
│   │   │   ├── data-table.tsx
│   │   │   ├── columns.tsx
│   │   │   ├── filters.tsx
│   │   │   └── pagination.tsx
│   │   ├── form/
│   │   │   ├── form-field.tsx
│   │   │   ├── form-section.tsx
│   │   │   └── file-upload.tsx
│   │   ├── search/
│   │   │   ├── global-search.tsx
│   │   │   └── search-results.tsx
│   │   ├── notifications/
│   │   │   ├── notification-center.tsx
│   │   │   └── notification-item.tsx
│   │   └── permission-gate.tsx
│   │
│   ├── modules/                # Module-specific components
│   │   ├── hr/
│   │   │   ├── employee-card.tsx
│   │   │   ├── employee-form.tsx
│   │   │   ├── org-chart.tsx
│   │   │   └── contract-viewer.tsx
│   │   ├── crm/
│   │   │   ├── deal-card.tsx
│   │   │   ├── deal-pipeline.tsx
│   │   │   ├── lead-form.tsx
│   │   │   └── activity-timeline.tsx
│   │   ├── projects/
│   │   │   ├── project-card.tsx
│   │   │   ├── task-board.tsx
│   │   │   ├── gantt-chart.tsx
│   │   │   └── time-tracker.tsx
│   │   ├── finance/
│   │   │   ├── invoice-preview.tsx
│   │   │   ├── payment-form.tsx
│   │   │   └── chart-of-accounts.tsx
│   │   ├── brain/
│   │   │   ├── document-viewer.tsx
│   │   │   ├── search-interface.tsx
│   │   │   ├── chat-interface.tsx
│   │   │   └── knowledge-graph.tsx
│   │   └── compliance/
│   │       ├── risk-matrix.tsx
│   │       ├── capa-workflow.tsx
│   │       └── audit-trail-viewer.tsx
│   │
│   └── charts/                 # Analytics charts
│       ├── line-chart.tsx
│       ├── bar-chart.tsx
│       ├── pie-chart.tsx
│       └── dashboard-widgets/
│           ├── kpi-card.tsx
│           ├── activity-feed.tsx
│           └── recent-alerts.tsx
│
├── hooks/
│   ├── use-auth.ts
│   ├── use-permissions.ts
│   ├── use-notifications.ts
│   ├── use-api.ts
│   ├── use-debounce.ts
│   ├── use-local-storage.ts
│   └── modules/
│       ├── use-employees.ts
│       ├── use-deals.ts
│       ├── use-projects.ts
│       └── use-documents.ts
│
├── lib/
│   ├── api/
│   │   ├── client.ts           # API client setup
│   │   ├── endpoints.ts        # API endpoint definitions
│   │   ├── interceptors.ts     # Request/response interceptors
│   │   └── error-handling.ts
│   ├── auth/
│   │   ├── keycloak.ts
│   │   ├── session.ts
│   │   └── permissions.ts
│   ├── utils/
│   │   ├── format.ts           # Date, currency formatting
│   │   ├── validate.ts         # Validation helpers
│   │   ├── calculate.ts        # Calculations
│   │   └── export.ts           # Export helpers (CSV, PDF)
│   └── constants/
│       ├── routes.ts
│       ├── permissions.ts
│       └── modules.ts
│
├── stores/
│   ├── auth-store.ts
│   ├── ui-store.ts
│   └── notification-store.ts
│
├── types/
│   ├── api.ts
│   ├── auth.ts
│   ├── modules/
│   │   ├── hr.ts
│   │   ├── crm.ts
│   │   ├── projects.ts
│   │   ├── finance.ts
│   │   ├── brain.ts
│   │   └── compliance.ts
│   └── common.ts
│
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── themes/
│       ├── light.css
│       └── dark.css
│
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── logo-dark.svg
│   │   └── icons/
│   ├── fonts/
│   └── locales/                # i18n files
│       ├── en/
│       │   └── common.json
│       └── ar/
│           └── common.json
│
├── middleware.ts               # Next.js middleware
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### apps/api/ - API Gateway

```
apps/api/
├── src/
│   ├── main.ts                 # Application entry
│   ├── app.module.ts           # Root module
│   │
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── keycloak.config.ts
│   │   ├── rabbitmq.config.ts
│   │   └── swagger.config.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── permissions.decorator.ts
│   │   │   ├── audit-log.decorator.ts
│   │   │   └── api-response.decorator.ts
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── validation.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── permissions.guard.ts
│   │   │   └── company-context.guard.ts
│   │   ├── interceptors/
│   │   │   ├── audit-log.interceptor.ts
│   │   │   ├── transform.interceptor.ts
│   │   │   └── cache.interceptor.ts
│   │   ├── pipes/
│   │   │   ├── validation.pipe.ts
│   │   │   └── parse-int.pipe.ts
│   │   └── utils/
│   │       ├── pagination.util.ts
│   │       └── query-builder.util.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── keycloak.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── refresh-token.dto.ts
│   │   │
│   │   ├── audit/
│   │   │   ├── audit.module.ts
│   │   │   ├── audit.controller.ts
│   │   │   ├── audit.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── audit-log.schema.ts
│   │   │   └── dto/
│   │   │       ├── query-audit.dto.ts
│   │   │       └── export-audit.dto.ts
│   │   │
│   │   ├── events/
│   │   │   ├── events.module.ts
│   │   │   ├── events.service.ts
│   │   │   ├── events.controller.ts
│   │   │   └── subscribers/
│   │   │       └── system-event.subscriber.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── notification.schema.ts
│   │   │   └── channels/
│   │   │       ├── email.channel.ts
│   │   │       ├── in-app.channel.ts
│   │   │       └── push.channel.ts
│   │   │
│   │   ├── permissions/
│   │   │   ├── permissions.module.ts
│   │   │   ├── permissions.controller.ts
│   │   │   ├── permissions.service.ts
│   │   │   ├── schemas/
│   │   │   │   ├── permission.schema.ts
│   │   │   │   └── role.schema.ts
│   │   │   └── seeds/
│   │   │       └── default-roles.seed.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── user.schema.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       └── update-user.dto.ts
│   │   │
│   │   ├── health/
│   │   │   ├── health.module.ts
│   │   │   └── health.controller.ts
│   │   │
│   │   └── gateway/            # Module aggregation
│   │       ├── gateway.module.ts
│   │       └── controllers/
│   │           ├── hr.gateway.ts
│   │           ├── crm.gateway.ts
│   │           ├── projects.gateway.ts
│   │           ├── finance.gateway.ts
│   │           ├── brain.gateway.ts
│   │           └── compliance.gateway.ts
│   │
│   └── types/
│       ├── express.d.ts
│       └── common.d.ts
│
├── test/
│   ├── app.e2e-spec.ts
│   ├── jest-e2e.json
│   └── setup.ts
│
├── Dockerfile
├── Dockerfile.prod
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
└── package.json
```

### apps/rag-service/ - RAG AI Service

```
apps/rag-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   ├── qdrant.config.ts
│   │   ├── ollama.config.ts
│   │   └── rag.config.ts
│   │
│   ├── modules/
│   │   ├── ingestion/
│   │   │   ├── ingestion.module.ts
│   │   │   ├── ingestion.controller.ts
│   │   │   ├── ingestion.service.ts
│   │   │   ├── document-parser.service.ts
│   │   │   ├── chunking.service.ts
│   │   │   ├── embedding.service.ts
│   │   │   └── processors/
│   │   │       ├── pdf.processor.ts
│   │   │       ├── docx.processor.ts
│   │   │       ├── txt.processor.ts
│   │   │       └── html.processor.ts
│   │   │
│   │   ├── search/
│   │   │   ├── search.module.ts
│   │   │   ├── search.controller.ts
│   │   │   ├── search.service.ts
│   │   │   ├── hybrid-search.service.ts
│   │   │   ├── vector-search.service.ts
│   │   │   ├── keyword-search.service.ts
│   │   │   └── reranking.service.ts
│   │   │
│   │   ├── generation/
│   │   │   ├── generation.module.ts
│   │   │   ├── generation.controller.ts
│   │   │   ├── generation.service.ts
│   │   │   ├── llm.service.ts
│   │   │   ├── prompt-engineering.service.ts
│   │   │   └── citation.service.ts
│   │   │
│   │   ├── chat/
│   │   │   ├── chat.module.ts
│   │   │   ├── chat.controller.ts
│   │   │   ├── chat.service.ts
│   │   │   ├── conversation.service.ts
│   │   │   └── memory.service.ts
│   │   │
│   │   └── management/
│   │       ├── management.module.ts
│   │       ├── management.controller.ts
│   │       ├── management.service.ts
│   │       └── document-lifecycle.service.ts
│   │
│   ├── common/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── utils/
│   │
│   └── types/
│       ├── document.types.ts
│       ├── search.types.ts
│       └── chat.types.ts
│
├── models/                       # Downloaded models
│   └── .gitkeep
│
├── Dockerfile
├── Dockerfile.prod
└── package.json
```

---

## Packages Directory

### packages/core-platform/

```
packages/core-platform/
├── src/
│   ├── index.ts
│   ├── auth/
│   │   ├── index.ts
│   │   ├── auth.service.ts
│   │   ├── auth.types.ts
│   │   └── keycloak.client.ts
│   │
│   ├── audit/
│   │   ├── index.ts
│   │   ├── audit.service.ts
│   │   ├── audit.decorator.ts
│   │   ├── audit.interceptor.ts
│   │   ├── audit.schema.ts
│   │   └── audit.types.ts
│   │
│   ├── events/
│   │   ├── index.ts
│   │   ├── event-bus.service.ts
│   │   ├── event.publisher.ts
│   │   ├── event.subscriber.ts
│   │   ├── event.types.ts
│   │   └── definitions/
│   │       ├── system.events.ts
│   │       ├── user.events.ts
│   │       └── module.events.ts
│   │
│   ├── permissions/
│   │   ├── index.ts
│   │   ├── permission.service.ts
│   │   ├── permission.guard.ts
│   │   ├── permission.decorator.ts
│   │   ├── permission.types.ts
│   │   └── constants.ts
│   │
│   ├── company-context/
│   │   ├── index.ts
│   │   ├── company-context.service.ts
│   │   ├── company-context.middleware.ts
│   │   └── company-context.guard.ts
│   │
│   ├── database/
│   │   ├── index.ts
│   │   ├── mongodb.module.ts
│   │   ├── mongodb.service.ts
│   │   └── repositories/
│   │       ├── base.repository.ts
│   │       └── audit.repository.ts
│   │
│   └── utils/
│       ├── index.ts
│       ├── crypto.util.ts
│       ├── date.util.ts
│       └── validation.util.ts
│
├── package.json
└── tsconfig.json
```

### packages/module-hr/

```
packages/module-hr/
├── src/
│   ├── backend/
│   │   ├── hr.module.ts
│   │   ├── hr.controller.ts
│   │   ├── hr.service.ts
│   │   ├── hr.repository.ts
│   │   ├── commands/
│   │   │   ├── create-employee.command.ts
│   │   │   ├── update-employee.command.ts
│   │   │   └── terminate-employee.command.ts
│   │   ├── queries/
│   │   │   ├── get-employee.query.ts
│   │   │   ├── list-employees.query.ts
│   │   │   └── search-employees.query.ts
│   │   ├── entities/
│   │   │   ├── employee.entity.ts
│   │   │   ├── contract.entity.ts
│   │   │   ├── department.entity.ts
│   │   │   └── onboarding.entity.ts
│   │   ├── dto/
│   │   │   ├── create-employee.dto.ts
│   │   │   ├── update-employee.dto.ts
│   │   │   ├── employee-response.dto.ts
│   │   │   └── filters.dto.ts
│   │   ├── events/
│   │   │   ├── hr.events.ts
│   │   │   ├── hr.event-publisher.ts
│   │   │   └── hr.event-handler.ts
│   │   ├── permissions/
│   │   │   └── hr.permissions.ts
│   │   └── migrations/
│   │       └── 001-create-employees.ts
│   │
│   ├── frontend/
│   │   ├── components/
│   │   │   ├── employee-list/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── employee-row.tsx
│   │   │   │   └── employee-filters.tsx
│   │   │   ├── employee-form/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── personal-info-section.tsx
│   │   │   │   ├── employment-section.tsx
│   │   │   │   └── document-upload.tsx
│   │   │   ├── org-chart/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── org-node.tsx
│   │   │   │   └── org-connector.tsx
│   │   │   └── dashboard/
│   │   │       ├── hr-stats.tsx
│   │   │       ├── recent-hires.tsx
│   │   │       └── upcoming-reviews.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-employees.ts
│   │   │   ├── use-employee.ts
│   │   │   ├── use-create-employee.ts
│   │   │   └── use-departments.ts
│   │   │
│   │   ├── types/
│   │   │   └── hr.types.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── database/
│   │   ├── schemas/
│   │   │   ├── employee.schema.ts
│   │   │   ├── contract.schema.ts
│   │   │   └── department.schema.ts
│   │   ├── migrations/
│   │   │   └── 001-initial.ts
│   │   └── seeds/
│   │       └── default-departments.ts
│   │
│   ├── events/
│   │   ├── definitions.ts
│   │   ├── publishers.ts
│   │   └── subscribers.ts
│   │
│   ├── permissions/
│   │   ├── definitions.ts
│   │   ├── roles.ts
│   │   └── matrix.ts
│   │
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── hr.service.spec.ts
│   │   │   └── commands.spec.ts
│   │   └── integration/
│   │       └── hr-events.spec.ts
│   │
│   └── package.json
```

### packages/module-crm/

```
packages/module-crm/
├── src/
│   ├── backend/
│   │   ├── crm.module.ts
│   │   ├── crm.controller.ts
│   │   ├── crm.service.ts
│   │   ├── crm.repository.ts
│   │   ├── entities/
│   │   │   ├── lead.entity.ts
│   │   │   ├── deal.entity.ts
│   │   │   ├── contact.entity.ts
│   │   │   ├── organization.entity.ts
│   │   │   └── activity.entity.ts
│   │   ├── dto/
│   │   │   ├── lead.dto.ts
│   │   │   ├── deal.dto.ts
│   │   │   └── pipeline.dto.ts
│   │   ├── events/
│   │   │   ├── crm.events.ts
│   │   │   ├── crm.publisher.ts
│   │   │   └── crm.subscriber.ts
│   │   └── permissions/
│   │       └── crm.permissions.ts
│   │
│   ├── frontend/
│   │   ├── components/
│   │   │   ├── pipeline/
│   │   │   │   ├── kanban-board.tsx
│   │   │   │   ├── deal-card.tsx
│   │   │   │   └── stage-column.tsx
│   │   │   ├── lead-management/
│   │   │   │   ├── lead-list.tsx
│   │   │   │   └── lead-form.tsx
│   │   │   └── dashboard/
│   │   │       ├── revenue-chart.tsx
│   │   │       ├── conversion-funnel.tsx
│   │   │       └── activities-feed.tsx
│   │   ├── hooks/
│   │   │   ├── use-deals.ts
│   │   │   ├── use-leads.ts
│   │   │   └── use-pipeline.ts
│   │   └── types/
│   │
│   ├── database/
│   │   └── schemas/
│   │
│   ├── events/
│   │
│   └── permissions/
```

### packages/module-projects/

```
packages/module-projects/
├── src/
│   ├── backend/
│   │   ├── projects.module.ts
│   │   ├── projects.controller.ts
│   │   ├── projects.service.ts
│   │   ├── entities/
│   │   │   ├── project.entity.ts
│   │   │   ├── task.entity.ts
│   │   │   ├── time-log.entity.ts
│   │   │   └── milestone.entity.ts
│   │   ├── dto/
│   │   │   ├── project.dto.ts
│   │   │   ├── task.dto.ts
│   │   │   └── time-log.dto.ts
│   │   ├── events/
│   │   │   ├── projects.events.ts
│   │   │   ├── projects.publisher.ts
│   │   │   └── projects.subscriber.ts
│   │   └── permissions/
│   │
│   ├── frontend/
│   │   ├── components/
│   │   │   ├── project-board/
│   │   │   ├── gantt-chart/
│   │   │   ├── task-management/
│   │   │   └── time-tracking/
│   │   └── hooks/
│   │
│   ├── database/
│   ├── events/
│   └── permissions/
```

### packages/module-finance/

```
packages/module-finance/
├── src/
│   ├── backend/
│   │   ├── finance.module.ts
│   │   ├── finance.controller.ts
│   │   ├── finance.service.ts
│   │   ├── accounting/
│   │   │   ├── ledger.service.ts
│   │   │   ├── journal.service.ts
│   │   │   └── chart-of-accounts.service.ts
│   │   ├── invoicing/
│   │   │   ├── invoice.service.ts
│   │   │   ├── invoice.generator.ts
│   │   │   └── payment.service.ts
│   │   ├── payroll/
│   │   │   ├── payroll.service.ts
│   │   │   ├── calculation.service.ts
│   │   │   └── payslip.service.ts
│   │   ├── entities/
│   │   │   ├── transaction.entity.ts
│   │   │   ├── account.entity.ts
│   │   │   ├── invoice.entity.ts
│   │   │   └── payroll-record.entity.ts
│   │   ├── dto/
│   │   │   ├── transaction.dto.ts
│   │   │   ├── invoice.dto.ts
│   │   │   └── report.dto.ts
│   │   ├── events/
│   │   │   ├── finance.events.ts
│   │   │   ├── finance.publisher.ts
│   │   │   └── finance.subscriber.ts
│   │   └── permissions/
│   │
│   ├── frontend/
│   ├── database/
│   │   └── migrations/
│   │       ├── 001-create-accounts.ts
│   │       ├── 002-create-transactions.ts
│   │       └── 003-create-invoices.ts
│   ├── events/
│   └── permissions/
```

### packages/module-brain/

```
packages/module-brain/
├── src/
│   ├── backend/
│   │   ├── brain.module.ts
│   │   ├── brain.controller.ts
│   │   ├── brain.service.ts
│   │   ├── knowledge/
│   │   │   ├── knowledge.service.ts
│   │   │   ├── document.service.ts
│   │   │   └── version-control.service.ts
│   │   ├── entities/
│   │   │   ├── policy.entity.ts
│   │   │   ├── decision.entity.ts
│   │   │   ├── lesson-learned.entity.ts
│   │   │   └── document.entity.ts
│   │   ├── dto/
│   │   ├── events/
│   │   └── permissions/
│   │
│   ├── frontend/
│   ├── database/
│   ├── events/
│   └── permissions/
```

### packages/module-compliance/

```
packages/module-compliance/
├── src/
│   ├── backend/
│   │   ├── compliance.module.ts
│   │   ├── compliance.controller.ts
│   │   ├── compliance.service.ts
│   │   ├── risk/
│   │   │   ├── risk.service.ts
│   │   │   ├── risk-assessment.service.ts
│   │   │   └── risk-matrix.service.ts
│   │   ├── capa/
│   │   │   ├── capa.service.ts
│   │   │   ├── capa-workflow.service.ts
│   │   │   └── effectiveness-check.service.ts
│   │   ├── review/
│   │   │   ├── review.service.ts
│   │   │   └── minutes.service.ts
│   │   ├── entities/
│   │   │   ├── risk.entity.ts
│   │   │   ├── capa.entity.ts
│   │   │   └── management-review.entity.ts
│   │   ├── dto/
│   │   ├── events/
│   │   └── permissions/
│   │
│   ├── frontend/
│   ├── database/
│   ├── events/
│   └── permissions/
```

### packages/shared/

```
packages/shared/
├── types/
│   ├── src/
│   │   ├── index.ts
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   ├── common.types.ts
│   │   ├── events.types.ts
│   │   └── modules/
│   │       ├── hr.types.ts
│   │       ├── crm.types.ts
│   │       ├── projects.types.ts
│   │       ├── finance.types.ts
│   │       ├── brain.types.ts
│   │       └── compliance.types.ts
│   └── package.json
│
├── ui/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── forms/
│   │   │   ├── data-display/
│   │   │   └── feedback/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── styles/
│   ├── package.json
│   └── tailwind.config.ts
│
├── utils/
│   ├── src/
│   │   ├── string.ts
│   │   ├── date.ts
│   │   ├── number.ts
│   │   ├── validation.ts
│   │   ├── encryption.ts
│   │   └── http.ts
│   └── package.json
│
├── config/
│   ├── eslint/
│   ├── typescript/
│   └── tailwind/
│
└── constants/
    ├── src/
    │   ├── permissions.ts
    │   ├── modules.ts
    │   ├── routes.ts
    │   └── defaults.ts
    └── package.json
```

---

## Infrastructure Directory

```
infrastructure/
├── docker/
│   ├── development/
│   │   ├── docker-compose.yml
│   │   └── Dockerfile.dev
│   ├── production/
│   │   ├── docker-compose.yml
│   │   └── Dockerfile.prod
│   └── services/
│       ├── mongodb/
│       │   ├── Dockerfile
│       │   └── mongod.conf
│       ├── postgres/
│       │   ├── Dockerfile
│       │   └── init.sql
│       ├── keycloak/
│       │   ├── Dockerfile
│       │   └── realm-config.json
│       ├── rabbitmq/
│       │   ├── Dockerfile
│       │   └── definitions.json
│       ├── qdrant/
│       │   └── qdrant.yaml
│       └── ollama/
│           └── Dockerfile
│
├── kubernetes/
│   ├── base/
│   │   ├── namespace.yaml
│   │   ├── configmap.yaml
│   │   └── secrets.yaml
│   ├── apps/
│   │   ├── web-deployment.yaml
│   │   ├── api-deployment.yaml
│   │   └── rag-deployment.yaml
│   ├── databases/
│   │   ├── mongodb-statefulset.yaml
│   │   ├── postgres-statefulset.yaml
│   │   └── qdrant-statefulset.yaml
│   ├── ingress/
│   │   └── ingress.yaml
│   └── monitoring/
│       ├── prometheus.yaml
│       └── grafana.yaml
│
├── terraform/
│   ├── modules/
│   │   ├── vpc/
│   │   ├── compute/
│   │   └── database/
│   ├── environments/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── prod/
│   └── variables.tf
│
├── nginx/
│   ├── nginx.conf
│   ├── ssl/
│   │   ├── api.blih.company.com.crt
│   │   └── api.blih.company.com.key
│   └── sites-available/
│       ├── api.conf
│       └── app.conf
│
└── scripts/
    ├── init-cluster.sh
    ├── deploy-k8s.sh
    └── rotate-certs.sh
```

---

## Docs Directory

```
docs/
├── api/
│   ├── openapi.yaml            # OpenAPI specification
│   ├── authentication.md
│   ├── errors.md
│   └── rate-limiting.md
│
├── architecture/
│   ├── overview.md
│   ├── data-flow.md
│   ├── event-driven.md
│   ├── security.md
│   └── decisions/
│       ├── 001-nestjs.md
│       ├── 002-mongodb-postgres.md
│       └── 003-rabbitmq.md
│
├── deployment/
│   ├── quickstart.md
│   ├── production.md
│   ├── ssl-setup.md
│   ├── backup-restore.md
│   └── troubleshooting.md
│
├── compliance/
│   ├── iso-9001-mapping.md
│   ├── iso-14001-mapping.md
│   ├── iso-45001-mapping.md
│   └── audit-trail.md
│
├── development/
│   ├── setup.md
│   ├── conventions.md
│   ├── testing.md
│   └── debugging.md
│
├── modules/
│   ├── hr.md
│   ├── crm.md
│   ├── projects.md
│   ├── finance.md
│   ├── brain.md
│   └── compliance.md
│
└── operations/
    ├── monitoring.md
    ├── alerting.md
    ├── runbooks/
    │   ├── database-outage.md
    │   ├── api-degraded.md
    │   └── security-incident.md
    └── maintenance.md
```

---

## Tests Directory

```
tests/
├── e2e/
│   ├── playwright.config.ts
│   ├── fixtures/
│   │   └── auth.fixture.ts
│   ├── tests/
│   │   ├── auth/
│   │   │   ├── login.spec.ts
│   │   │   └── logout.spec.ts
│   │   ├── hr/
│   │   │   ├── employee-workflow.spec.ts
│   │   │   └── onboarding.spec.ts
│   │   ├── crm/
│   │   │   ├── deal-pipeline.spec.ts
│   │   │   └── lead-conversion.spec.ts
│   │   ├── projects/
│   │   ├── finance/
│   │   ├── brain/
│   │   └── compliance/
│   └── utils/
│       └── test-helpers.ts
│
├── integration/
│   ├── jest.config.js
│   ├── setup.ts
│   ├── tests/
│   │   ├── api-gateway.spec.ts
│   │   ├── event-flows.spec.ts
│   │   ├── database-connections.spec.ts
│   │   └── module-integration.spec.ts
│   └── fixtures/
│       └── test-data.ts
│
├── load/
│   ├── k6/
│   │   ├── api-load.js
│   │   ├── rag-load.js
│   │   └── stress-test.js
│   └── artillery/
│       └── config.yml
│
├── security/
│   ├── owasp-zap/
│   │   └── scan-config.xml
│   ├── dependency-check/
│   │   └── suppression.xml
│   └── penetration/
│       └── test-plan.md
│
└── unit/
    └── coverage/
        └── threshold.json
```

---

## Scripts Directory

```
scripts/
├── setup/
│   ├── init-dev.sh
│   ├── init-db.sh
│   └── init-keycloak.sh
│
├── deployment/
│   ├── build.sh
│   ├── deploy-staging.sh
│   ├── deploy-prod.sh
│   └── rollback.sh
│
├── maintenance/
│   ├── backup.sh
│   ├── restore.sh
│   ├── cleanup.sh
│   └── log-rotation.sh
│
├── database/
│   ├── migrate.sh
│   ├── seed.sh
│   ├── backup-mongodb.sh
│   └── backup-postgres.sh
│
├── monitoring/
│   ├── health-check.sh
│   ├── disk-usage.sh
│   └── alert-test.sh
│
└── development/
    ├── generate-module.sh
    ├── generate-api-client.sh
    └── sync-types.sh
```

---

## Configuration Files

### Root Package.json

```json
{
  "name": "blih-system",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "test:e2e": "playwright test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean && rm -rf node_modules",
    "setup": "./scripts/setup/init-dev.sh",
    "deploy:staging": "./scripts/deployment/deploy-staging.sh",
    "deploy:prod": "./scripts/deployment/deploy-prod.sh"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "type-check": {}
  }
}
```

### .gitignore

```
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
.next/
dist/
build/
out/

# Environment
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Docker volumes
volumes/

# Misc
*.pid
*.seed
*.pid.lock
```

---

## Summary

**Total Directory Structure:**

- **apps/**: 3 main applications (web, api, rag-service)
- **packages/**: 8 packages (core + 6 modules + shared)
- **infrastructure/**: Docker, K8s, Terraform configs
- **docs/**: Complete documentation
- **tests/**: E2E, integration, load, security tests
- **scripts/**: Automation and utility scripts

**Key Files:**

- `package.json`: Workspace configuration
- `pnpm-workspace.yaml`: PNPM workspace
- `turbo.json`: Build pipeline
- `docker-compose.yml`: Development environment
- `docker-compose.prod.yml`: Production environment

This structure supports:

- **Modular development**: Each module is self-contained
- **Shared code**: Common types, UI, utilities in packages/shared
- **Scalable deployment**: Docker + K8s ready
- **Comprehensive testing**: Unit, integration, E2E, load, security
- **Documentation**: Architecture, API, deployment guides
