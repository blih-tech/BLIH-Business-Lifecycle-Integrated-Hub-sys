# BLIH Quick Start Checklist

## Pre-Development Setup (Day 1)

### Development Environment

- [ ] Install Node.js 20.x
- [ ] Install Docker & Docker Compose
- [ ] Install pnpm (or npm)
- [ ] Install Git
- [ ] Set up IDE (VS Code recommended)
- [ ] Install VS Code extensions:
  - [ ] ESLint
  - [ ] Prettier
  - [ ] Docker
  - [ ] TypeScript

### Repository Setup

- [ ] Initialize monorepo structure
- [ ] Set up package.json workspaces
- [ ] Configure TypeScript (strict mode)
- [ ] Set up ESLint + Prettier
- [ ] Configure Git hooks (Husky)
- [ ] Create .gitignore

### Infrastructure Services (Docker Compose)

- [ ] MongoDB container
- [ ] PostgreSQL container
- [ ] Keycloak container
- [ ] RabbitMQ container
- [ ] MinIO container
- [ ] Qdrant container (optional for Week 1)
- [ ] All services healthy and accessible

---

## Week 1-2: Foundation

### Day 1-3: Infrastructure

- [ ] Docker Compose file created
- [ ] All services start successfully
- [ ] Database connections tested
- [ ] Environment variables configured (.env)
- [ ] Health check endpoints working

### Day 4-7: Keycloak Integration

- [ ] Keycloak realm created (`blih-realm`)
- [ ] Client configured (backend + frontend)
- [ ] Initial admin user created
- [ ] JWT token validation working
- [ ] Login flow functional in frontend

### Day 8-10: Audit Logging

- [ ] Audit log MongoDB collection created
- [ ] Audit service implemented
- [ ] Audit middleware integrated
- [ ] First audit entry logged
- [ ] Audit log export function working

### Day 11-14: Event Bus

- [ ] RabbitMQ connection established
- [ ] Event emitter service created
- [ ] First event published
- [ ] First event subscriber working
- [ ] Event types defined in shared package

**Week 1-2 Deliverable:** Login works, audit logs, events flow

---

## Week 3-4: Core Platform

### RBAC System

- [ ] Permission model defined
- [ ] Permission guard implemented
- [ ] Permission decorator created
- [ ] Role-to-permission mapping stored
- [ ] User permissions cached in JWT

### Company Context

- [ ] Company service created
- [ ] Single `company_id` enforced
- [ ] Company context middleware
- [ ] All queries filtered by company_id

### Notification Service

- [ ] Notification model (MongoDB)
- [ ] In-app notification API
- [ ] Email notification (SMTP)
- [ ] Webhook support (optional)

### User Management UI

- [ ] User list page
- [ ] User create/edit forms
- [ ] Role assignment UI
- [ ] Permission matrix view

**Week 3-4 Deliverable:** RBAC enforced, users manageable, notifications working

---

## Week 5-6: Brain + HR Module

### Brain Module (Week 5)

- [ ] MongoDB collections: policies, sops, decisions
- [ ] Document versioning implemented
- [ ] Event observer service
- [ ] Basic search (MongoDB text index)
- [ ] Brain UI (list, create, view)

### HR Module (Week 6)

- [ ] Employee entity/schema
- [ ] Employee CRUD API
- [ ] Employee list UI
- [ ] Employee form (create/edit)
- [ ] Contract management (basic)
- [ ] Event: `hr.employee.hired` published
- [ ] Integration: Brain observes HR events

**Week 5-6 Deliverable:** HR module functional, Brain storing knowledge

---

## Week 7-8: CRM + Projects

### CRM Module

- [ ] Lead entity
- [ ] Contact entity
- [ ] Organization entity
- [ ] Deal entity
- [ ] Pipeline/kanban UI
- [ ] Event: `crm.deal.won` published
- [ ] Event: `crm.deal.lost` published

### Projects Module

- [ ] Project entity
- [ ] Task entity
- [ ] Subscribes to `crm.deal.won`
- [ ] Auto-creates project from deal
- [ ] Project list/detail UI
- [ ] Task management UI
- [ ] Event: `project.created` published

**Week 7-8 Deliverable:** Sales-to-delivery pipeline working

---

## Week 9-10: Finance + Integration

### Finance Module

- [ ] PostgreSQL schema (transactions, accounts)
- [ ] Double-entry bookkeeping logic
- [ ] Invoice entity
- [ ] Payroll calculation (basic)
- [ ] Expense claim entity
- [ ] Subscribes to `crm.deal.won` → generates invoice
- [ ] Finance UI (invoices, expenses)

### Full Integration Testing

- [ ] End-to-end: Deal won → Project created → Invoice generated
- [ ] All events logged in audit
- [ ] Brain captures patterns
- [ ] Integration tests passing

**Week 9-10 Deliverable:** Financial operations integrated

---

## Week 11-12: AI + Compliance

### AI Chatbot

- [ ] Qdrant setup
- [ ] Embedding generation (Ollama)
- [ ] Chatbot API (permission-gated)
- [ ] Chatbot UI
- [ ] Query logging to audit
- [ ] Response redaction working

### Compliance Extensions

- [ ] Risk Register collection
- [ ] Risk Register UI (list, create, detail)
- [ ] CAPA collection
- [ ] CAPA lifecycle (8 stages)
- [ ] CAPA UI
- [ ] Management Review template
- [ ] Management Review UI

**Week 11-12 Deliverable:** AI assistance + compliance evidence generation

---

## Week 13-14: Hardening

### Security

- [ ] Encryption at rest (MinIO, DB configs)
- [ ] HTTPS enforced
- [ ] Secrets management (Docker secrets)
- [ ] RBAC matrix tested (all permissions)
- [ ] SQL injection tests passed
- [ ] XSS protection verified

### Performance

- [ ] Database indexes created
- [ ] Query optimization (slow query log reviewed)
- [ ] Caching (Redis) for frequent reads
- [ ] Load testing (50+ users simulated)
- [ ] Response times < 500ms (p95)

### Testing

- [ ] Unit test coverage > 70%
- [ ] Integration tests for all workflows
- [ ] E2E tests for critical paths
- [ ] Audit trail verification (no gaps)

### Documentation

- [ ] API documentation (Swagger/OpenAPI)
- [ ] Deployment guide
- [ ] User manual (basic)
- [ ] Troubleshooting guide

### Pilot Deployment

- [ ] Production Docker Compose configured
- [ ] Backup scripts tested
- [ ] Restore procedure verified
- [ ] Internal pilot with real data
- [ ] Mock audit walkthrough completed

**Week 13-14 Deliverable:** Production-ready system

---

## Daily Stand-up Questions

1. What did you complete yesterday?
2. What are you working on today?
3. Any blockers?
4. Integration points working?

## Weekly Demo Checklist

- [ ] Core Platform: RBAC, Audit, Events
- [ ] Modules: At least one module demo
- [ ] Integration: Show event flow
- [ ] UI: Show user-facing features
- [ ] Compliance: Show evidence generation

## Definition of Done (Per Feature)

- [ ] Backend API implemented
- [ ] Frontend UI implemented
- [ ] RBAC permissions defined
- [ ] Events published (if applicable)
- [ ] Audit logging working
- [ ] Unit tests written
- [ ] Integration tested
- [ ] Documentation updated

---

## Critical Path Items (Cannot Slip)

1. **Week 2:** Keycloak + Audit logging (foundation)
2. **Week 4:** RBAC system (security)
3. **Week 6:** First module (HR) working (proof of concept)
4. **Week 8:** Integration working (CRM → Projects)
5. **Week 10:** Finance integrated (complete workflow)
6. **Week 12:** Compliance extensions (audit readiness)
7. **Week 14:** Security hardening (production readiness)

If any of these slip, adjust scope immediately.

---

## Red Flags (Stop and Reassess)

- ❌ Keycloak integration taking > 1 week
- ❌ Event bus unreliable (events lost)
- ❌ Audit logs not writing
- ❌ RBAC not enforcing permissions
- ❌ Database migrations failing
- ❌ Integration tests failing consistently
- ❌ Team velocity dropping > 30%

If you hit 2+ red flags, pause and fix before continuing.

---

## Success Metrics

**Technical:**

- All services healthy (Docker ps)
- Zero critical security vulnerabilities
- API response time < 500ms (p95)
- Test coverage > 70%

**Functional:**

- End-to-end workflow working (deal → project → invoice)
- Audit trail complete (no gaps)
- RBAC enforced (access denied when expected)
- Compliance evidence exportable

**Team:**

- Daily stand-ups happening
- Weekly demos showing progress
- No major blockers > 2 days
- Team morale positive

---

**Remember:** This is a marathon, not a sprint. Focus on working software over perfect code. Iterate based on real usage.
