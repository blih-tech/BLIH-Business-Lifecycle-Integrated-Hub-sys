BLIH System Documentation
Version: 1.0
Planned Release: Q1 2026
Authors: Tariku Abera
Approval Status:
Document Purpose
This document is the authoritative system reference for BLIH (Business Lifecycle Integrated Hub)—a modular, on‑premises enterprise platform designed for single‑company deployments. It defines the system architecture, core modules, deployment and operational model, security controls, and built‑in compliance and evidence‑generation mechanisms. The documentation is structured to support implementation teams, operational owners, and external auditors, with explicit cross‑references to appendices covering terminology, standards mappings, scope boundaries, databases, and audit artifacts.
Referenced appendices include: Glossary (Appendix 8.1), Standards & Technical References (Appendix 8.2), ISO 9001 mappings (Appendix 8.3), ISO/IEC 27001 mappings (Appendix 8.4), Scope & Responsibility Boundaries (Appendix 8.5), Audit Evidence Checklists (Appendix 8.6), Database Architecture (Appendix 8.7), Risk Register (Appendix 8.8), Corrective and Preventive Actions – CAPA (Appendix 8.9), Management Review (Appendix 8.10), and Auditor Walkthrough Guidance (Appendix 8.11).

1. Introduction
   1.1 System Overview
   BLIH is a modular enterprise operating platform engineered for on‑premises, single‑organization environments. It integrates essential business domains Human Resources (HR), Customer Relationship Management (CRM), Project Management, Finance, and Organizational Knowledge—within a unified governance and security framework. AI‑assisted analytics and automation are embedded to enhance operational efficiency, enforce standardized processes, and preserve institutional knowledge.
   The platform is explicitly designed for compliance intensive environments, including jurisdictions with strict data‑sovereignty or tax‑regulatory requirements (for example, Ethiopian withholding‑tax obligations; see Appendix 8.2). BLIH emphasizes traceability, auditability, and controlled extensibility to reduce operational risk and dependency on individual employees.
   Key Characteristics
   • Single‑Company Deployment Model
   BLIH operates under a single logical company_id (default: BLIH). Multi‑tenancy is intentionally excluded to guarantee strict data isolation, simplified access control, and clear accountability. This design directly supports ISO/IEC 27001 access‑control and information‑segregation requirements (Appendix 8.4).
   • Modular Architecture
   Each business domain is implemented as an independent module that can be deployed, licensed, and operated separately. Inter‑module interactions are handled exclusively through APIs and event‑driven mechanisms, ensuring loose coupling, controlled dependencies, and audit‑friendly integration paths (see Event‑Driven Architecture in Appendix 8.1).
   • On‑Premises and Air‑Gapped Readiness
   BLIH is deployed using containerized infrastructure (Docker) and supports environments with limited or no internet connectivity. This enables use in high‑security, regulated, or air‑gapped networks and aligns with operational‑planning and control requirements under ISO 9001 (Appendix 8.3).
   • Knowledge‑Centric Design
   The BLIH Brain module passively observes system events and documents to build an institutional knowledge base. The AI Chatbot provides contextual, role‑restricted assistance without bypassing access controls or exposing raw data. Functional and ethical boundaries are defined in Appendix 8.5.
   • Technology Stack (Summary)
   Full technical references are provided in Appendix 8.2.
   ◦ Backend: NestJS
   ◦ Frontend: Next.js
   ◦ Databases: MongoDB (HR, CRM, Projects, Brain), PostgreSQL (Finance)
   ◦ Identity & Access Management: Keycloak (RBAC)
   ◦ Automation: n8n and Storage & Search: MinIO (object storage), Qdrant (vector search)
   BLIH embeds compliance evidence generation into its core workflows, making it suitable as a primary operational system in organizations pursuing or maintaining ISO 9001:2015 and ISO/IEC 27001:2022 certification (see Appendices 8.3–8.6).
   1.2 Purpose and Scope
   The purpose of this documentation is to provide a complete, auditable reference for the design, deployment, and operation of BLIH Version 1.0. It supports both technical implementation and formal compliance assessment.
   This document covers:
   • System architecture and core design principles
   • Detailed descriptions of business modules and supporting services
   • Deployment, configuration, and operational requirements
   • Security controls, access models, and audit logging
   • Built‑in mechanisms for standards alignment and evidence generation
   The scope is explicitly limited to Version 1.0 capabilities. Future enhancements, SaaS offerings, or third‑party extensions are excluded unless formally documented in later revisions. Organizational governance activities (such as policy authorship or risk ownership) remain the responsibility of the deploying organization, as clarified in Appendix 8.5.
   1.3 Intended Audience
   This document is intended for the following audiences:
   • Software Engineers and System Integrators: Architecture, APIs, data models, and extension points (Appendix 8.7).
   • System Administrators, CTOs, and IT Managers: Deployment, configuration, monitoring, backup, and upgrade procedures.
   • Operational End‑Users: High‑level understanding of workflows and AI‑assisted features.
   • Compliance Officers and External Auditors: Standards mappings, evidence artifacts, and audit navigation (Appendices 8.3–8.11).
   • Executive Stakeholders: System scope, value proposition, and modular licensing strategy.
   1.4 Versioning and Change Control
   • Current Version: 1.0 (Initial Baseline Release)
   • Planned Release Window: Q4 2026
   • Licensing Model: Per‑module licensing with offline validation support for restricted networks
   • Change Management:
   All system changes are introduced through versioned migrations and recorded in immutable audit logs. Documentation updates follow a controlled review and approval process consistent with ISO 9001 Clause 7.5 (Documented Information). Evidence of changes and approvals is referenced in Appendix 8.6.
2. Architectural Overview
   2.1 Architectural Vision and Design Principles
   BLIH is designed to function as a self‑documenting enterprise platform, combining operational execution with continuous knowledge capture and compliance assurance. The system fulfills four complementary roles:
   • Institutional Memory: Centralized preservation of decisions, workflows, and lessons learned
   • Process Enforcer: Automation of standardized, approved business processes
   • Analytical and Learning Engine: AI‑assisted analysis of events and historical data
   • Operational Control Hub: Unified governance across business domains

Foundational Design Principles 1. Single‑Organization Isolation: Ensures data sovereignty, accountability, and regulatory clarity. 2. Module Autonomy: Each module maintains its own datastore and lifecycle, reducing systemic risk. 3. Event‑Driven Extensibility: Asynchronous events enable integration without tight coupling. 4. Centralized Governance: Cross‑cutting concerns (identity, audit, configuration) are enforced by the Core Platform. 5. Controlled AI Usage: AI components operate strictly within role‑based permissions and approved data scopes.
These principles are mapped to ISO 9001 operational controls and ISO/IEC 27001 organizational and technical controls in Appendices 8.3 and 8.4.
2.2 High‑Level System Architecture
BLIH follows a layered architecture that separates concerns and simplifies assurance activities: 1. Presentation Layer: Next.js web interfaces for dashboards, data entry, reporting, and AI interactions. 2. Core Platform Layer: Central services for authentication, authorization, auditing, configuration, and notifications. 3. Business Modules Layer: Independent services for HR, CRM, Projects, and Finance. 4. Knowledge and AI Layer: BLIH Brain (knowledge repository) and AI Chatbot (guided interaction). 5. Infrastructure Layer: Databases, object storage, search, caching, and container runtime.
This layered separation supports least‑privilege access, fault isolation, and clear audit boundaries. Auditor navigation guidance is provided in Appendix 8.11.
2.3 Core Architectural Components
2.3.1 Core Platform Services
The Core Platform provides governance and control functions common to all modules:
• Identity and Access Management: Keycloak‑based authentication and role‑based access control (RBAC), with permissions such as HR:employee:view (definitions in Appendix 8.1; ISO mappings in Appendix 8.4).
• Organizational Context Management: Central definition of company profile, departments, roles, and users.
• Audit Logging and Compliance Services: Immutable audit records capturing user actions, timestamps, affected records, and contextual metadata (primary evidence source; Appendix 8.6).
• Notification Services: In‑app alerts, email, and webhook delivery with monitoring hooks.
• System Configuration Management: Environment‑based configuration and feature toggles.
2.3.2 Event‑Driven Integration Layer
• Mechanism: Publish/subscribe messaging and webhooks
• Typical Events: crm.deal.won, hr.employee.hired, project.completed
• Purpose: Decouple modules, improve resilience, and support controlled extensibility
Event handling aligns with ISO 9001 operational control requirements (Appendix 8.3).
2.3.3 Data Storage Components
• MongoDB: Primary datastore for HR, CRM, Projects, and knowledge records
• PostgreSQL: Financial ledgers and transactions requiring ACID guarantees
• Qdrant: Vector storage for AI‑assisted search and retrieval
• MinIO: Encrypted object storage for documents and attachments
A detailed database and backup overview is provided in Appendix 8.7.
2.3.4 Security Architecture
• Role‑Based Access Control: Least‑privilege enforcement across all modules
• Authentication Tokens: JWT‑based sessions issued by Keycloak
• Cryptographic Protections: Encryption in transit and at rest
• AI Access Safeguards: Permission‑checked queries and redaction rules
Security controls are mapped to ISO/IEC 27001:2022 Annex A in Appendix 8.4.
2.4 Non‑Functional Requirements
• Security and Compliance: Comprehensive audit trails and evidence capture
• Scalability: Horizontal scaling via containers; module‑level isolation
• Performance: Asynchronous processing; optional caching layers
• Reliability and Availability: Backup, restore, and retry mechanisms
• Maintainability: Versioned APIs, documented change control, and clear ownership
These requirements directly support operational effectiveness and audit readiness under ISO 9001 and ISO/IEC 27001.

3. Module Architecture and Functional Description
   This section defines the functional scope, internal controls, data structures, and integration patterns of each BLIH module. All modules are implemented using a standardized structure to ensure consistency, traceability, and controlled operation, in alignment with ISO 9001:2015 Clauses 7.5 (Documented Information) and 8 (Operation), and ISO/IEC 27001:2022 requirements for system integrity and auditability.
   3.0 Standard Module Structure
   Each module adheres to the following baseline structure to support maintainability, segregation of duties, and audit readiness:
   module-name/
   ├── backend/ # NestJS services, controllers, guards, validation
   ├── frontend/ # Next.js UI components and views
   ├── database/ # Schemas, migrations, indexes, seed data
   ├── events/ # Event publishers/subscribers
   ├── permissions/ # RBAC permission definitions
   ├── docs/ # Module documentation and API specifications
   └── tests/ # Unit, integration, and end-to-end tests
   This structure enforces controlled change, repeatability, and verifiable implementation across all modules.
   3.1 BLIH Team (Human Resources Module)
   Control Objective: Ensure consistent management of the employee lifecycle, competence tracking, and workforce-related records, supporting organizational capability and awareness (ISO 9001:2015 Clauses 7.1–7.2).
   Functional Scope:
   • Recruitment and applicant lifecycle management
   • Hiring approvals and contract administration
   • Onboarding and training assignment
   • Attendance, leave, and availability management
   • Performance evaluation and career progression
   • Disciplinary handling and controlled offboarding

Key Records (MongoDB):
• Employee master records
• Employment contracts and amendments
• Attendance and leave logs
• Performance reviews and objectives
• Training and certification evidence
• Exit and knowledge-transfer records
Process Controls:
• State-driven workflows with approval gates
• Automatic event emission on lifecycle changes
• Immutable HR event logs for audit evidence
Inter-Module Interfaces:
• Publishes workforce status changes to Finance and Projects
• Consumes project feedback for performance evaluation
3.2 BLIH CRM (Customer Relationship Management Module)
Control Objective: Ensure controlled handling of customer interactions, opportunities, and revenue pipelines, supporting customer satisfaction and contractual compliance (ISO 9001:2015 Clause 8.2).
Functional Scope:
• Lead capture, qualification, and assignment
• Contact and organization management
• Sales pipelines and deal governance
• Interaction logging and proposal control
• Forecasting, retention monitoring, and analytics
Key Records (MongoDB):
• Leads and contacts
• Customer organizations
• Deals and pipelines
• Interaction histories
• CRM audit events

Process Controls:
• Rule-based pipeline transitions
• Probability and health-score calculations
• Full traceability of deal decisions
Inter-Module Interfaces:
• Publishes deal outcomes to Projects, Finance, and Brain
• Consumes delivery feedback for account health assessment

3.3 BLIH Projects (Project Execution Module)
Control Objective: Ensure planned, monitored, and controlled delivery of products and services (ISO 9001:2015 Clause 8.5).
Functional Scope:
• Project initiation (manual or automated)
• Task, milestone, and dependency management
• Resource allocation and workload balancing
• Time tracking and progress monitoring
• Risk and issue registration
Key Records (MongoDB):
• Project and task registers
• Resource assignments
• Timesheets and approvals
• Project event logs
Process Controls:
• Dependency resolution and status propagation
• Automated alerts for deviations
• Controlled feedback loops into HR and Finance

3.4 BLIH Finance (Financial Management Module)
Control Objective: Maintain financial integrity, regulatory compliance, and accurate reporting, including jurisdiction-specific tax obligations.
Functional Scope:
• Payroll calculation and statutory deductions
• Invoicing and revenue recognition
• Expense submission and approval
• General ledger and reconciliation
• Financial and tax reporting
Key Records (PostgreSQL – ACID):
• Ledger transactions
• Payroll records
• Invoices and installments
• Expense claims
• Financial reports
Process Controls:
• Double-entry enforcement
• Configurable tax rule engines
• Segregation of approval duties
3.5 BLIH Brain (Knowledge and Compliance Module)
Control Objective: Preserve organizational knowledge, decisions, and documented procedures, ensuring controlled access and versioning (ISO 9001:2015 Clause 7.5).
Functional Scope:
• SOP and policy management
• Decision and rationale tracking
• Lessons learned and insights
• Organizational structure reference
• Compliance documentation storage

Key Records (MongoDB):
• SOPs and policies (versioned)
• Decisions and lessons learned
• Analytical insights
Process Controls:
• Approval workflows for knowledge artifacts
• Version control and audit history
• Passive event observation only
3.6 AI Chatbot (Guided Assistance Interface)
Control Objective: Provide controlled, auditable guidance without introducing unauthorized data access or modification risks.
Functional Scope:
• Contextual guidance and explanations
• Workflow assistance
• Compliance and policy queries
Control Measures:
• RBAC-enforced access
• Brain-approved knowledge sources only
• Full query and response logging
3.7 Automation Layer (Workflow Orchestration)
Control Objective: Improve operational efficiency through controlled automation while maintaining visibility and auditability.
Functional Scope:
• Event-driven automations
• Approval and escalation workflows
• Scheduled compliance reminders
Control Measures:
• Admin-restricted flow design
• Execution logging and error tracking
• Integration via the BLIH event bus 4. Development Roadmap
4.1 Overview and Strategic Decision
To achieve full development of BLIH within 3 months (January 05 – April 05, 2026, exactly 12 weeks), the roadmap is aggressively scoped to deliver a complete, production-ready Version 1.0 with all core modules, compliance extensions, and evidence generation capabilities.
This is feasible with:
• A focused team (8 core members + 4–6 interns; see Human Resources Plan)
• Heavy phase overlap and parallel development
• Prioritization of compliance-critical features (Brain extensions: Risk Register, CAPA, Management Review)
• Acceptance of minimal viable polish in non-critical areas (e.g., advanced reporting deferred)
The result: A fully functional system meeting KR2.3 requirements (standardized core processes + baseline ISO controls) by April 05, 2026.
4.2 Detailed 12-Week Roadmap (January – March, 2026)
Week Dates Primary Focus Parallel Streams Key Deliverables Milestones / Gates
1 Jan 05–11 Core Platform setup Team onboarding, repo setup - Docker Compose skeleton<br>- Keycloak realm<br>- Basic RBAC engine<br>- Central audit log Login + first audit entry logged
2 Jan 12–18 Core Platform completion Event bus (RabbitMQ), notification service - Granular permissions<br>- Company context<br>- JWT auth<br>- Event pub/sub Role-based dashboard access enforced
3 Jan 19–25 BLIH Brain foundation + HR backend start Frontend scaffolding (Next.js layout) - Brain collections (decisions, references, lessons)<br>- Event observer<br>- HR employee & contract schemas First system event stored in Brain
4 Jan 26–Feb 01 HR core + Brain UI AI Chatbot MVP (local LLM) - Employee CRUD, onboarding workflow<br>- SOP/policy versioning<br>- Qdrant setup Policy uploaded, versioned, and queried via Chatbot
5 Feb 02–08 CRM backend + Projects start Risk Register (Appendix 8.8) in Brain - Leads, contacts, deals, pipelines<br>- Risk Register data model & dashboard First risk entry created; heatmap visible
6 Feb 09–15 CRM UI + Finance backend CAPA lifecycle (Appendix 8.9) - Pipeline kanban, interaction logs<br>- Finance transactions & payroll schemas Deal moved through pipeline; first CAPA logged
7 Feb 16–22 Projects core + Finance core Management Review template (Appendix 8.10) - Tasks, milestones, assignments<br>- Invoice & expense workflows Project created from deal win event
8 Feb 23–Mar 01 Full integrations & automation n8n workflows - Event flows: CRM→Projects→Finance→Brain<br>- Basic n8n automations (alerts) End-to-end workflow: deal win → project → invoice → Brain insight
9 Mar 02–08 Compliance extensions completion UI polish for Brain extensions - Risk Register full UI<br>- CAPA full lifecycle<br>- Management Review page Mock management review held with auto-inputs
10 Mar 09–15 Security hardening & testing End-to-end testing, audit trail verification - Encryption configs<br>- RBAC matrix testing<br>- Backup scripts Full audit trail export + access denial logs
11 Mar 16–22 Performance & reliability Documentation finalization - Load testing basics<br>- Migration scripts<br>- Final docs & appendices System stable under simulated load; documentation complete
12 Mar 23–March 31 Pilot deployment & validation Mock audit walkthrough (Appendix 8.11) - Production Docker package<br>- Internal pilot rollout<br>- Compliance evidence Successful mock audit using only BLIH; Version 1.0 released
4.3 Resource Allocation (Parallel Streams)
• Stream A (Backend Core): 2 senior backend devs – Core, Brain, integrations
• Stream B (Business Modules): 2 backend + 1 full-stack – HR → CRM → Projects → Finance
• Stream C (Frontend & UI): 1 senior frontend + interns – Shared components, module UIs
• Stream D (Compliance & AI): 1 AI engineer + 1 dev – Brain extensions, Chatbot, Risk/CAPA/MR
• Stream E (DevOps & Quality): 1 DevOps + 1 QA – Docker, testing, security
Interns support UI components, testing, and documentation under mentorship.

4.4 Risk Mitigation
• Daily stand-ups, weekly demos to catch blockers early.
• Critical path: Core → Brain → HR → Integrations (non-critical polish can slip).
• Contingency: If delay >1 week, deprioritize advanced n8n or non-essential reports.
• Quality Gates:
◦ Week 4: Secure login + audit working
◦ Week 7: Brain + Chatbot + Risk Register usable
◦ Week 9: CAPA + Management Review functional
◦ Week 12: Mock audit passed (Appendix 8.11)
4.5 Deliverables by April 05, 2026 (End of 3 Months)
• Complete Core Platform with RBAC, audit, notifications
• All business modules (HR, CRM, Projects, Finance) with core workflows
• Full BLIH Brain with SOPs, lessons, decisions
• AI Chatbot (role-aware, safe)
• Compliance extensions: Risk Register, CAPA, Management Review
• n8n automation layer basics
• Production-ready Docker deployment
• Full documentation with appendices
• Successful internal mock audit (Appendix 8.11)
This aggressive 3-month plan delivers the entire Version 1.0 system, fully compliant with KR2.3 objectives, ready for pilot clients and formal ISO preparation. 5. Deployment Guide
This section provides comprehensive, step-by-step instructions for deploying BLIH in on-premises environments. The process is designed for simplicity, security, and repeatability, supporting air-gapped installations and compliance requirements (e.g., ISO/IEC 27001:2022 availability and cryptographic controls; see Appendix 8.4).

5.1 Prerequisites
5.1.1 Hardware Requirements
Deployment Size CPU Cores RAM Storage Network Notes
Small (≤50 users) 8 32 GB 500 GB SSD Gigabit Ethernet Suitable for pilot/testing
Medium (51–200 users) 16–24 64 GB 1 TB SSD (RAID recommended) 10 GbE preferred Production with AI load
Large (>200 users) 32+ 128 GB+ 2 TB+ NVMe High-bandwidth + redundancy Add GPU for advanced AI
Additional Recommendations:
• Dedicated server or VM cluster (no shared hosting).
• UPS for power redundancy.
• Hardware security module (HSM) optional for key management.
5.1.2 Software Requirements
• Operating System: Linux (Ubuntu 22.04 LTS recommended) or Windows Server 2022 (Docker Desktop).
• Container Runtime: Docker Engine 24.x+ and Docker Compose v2.20+.
• Tools: Git, Node.js 20.x (for migrations), curl/wget.
5.1.3 Network & Security Prerequisites
• Firewall rules: Allow only necessary ports (80/443 for UI, 5432 for PostgreSQL if external monitoring).
• SSL/TLS certificates (Let's Encrypt or internal CA) for HTTPS.
• Secrets management preparation (Docker secrets or .env files).

5.2 Installation Steps 1. Repository Access
◦ Clone the private repository:

    git clone https://<repository-url>/blih-system.git

cd blih-system

    2. Environment Configuration
        ◦ Copy template
    cp .env.example .env

        ◦ Edit .env with required values (see Table 5.2.1 for key variables).
        ◦ Use Docker secrets for production-sensitive values (e.g., database passwords).

Table 5.2.1 – Critical Environment Variables
Variable Description Example / Notes
COMPANY_ID Single company identifier "BLIH" (customizable)
KEYCLOAK_ADMIN_PASSWORD Keycloak admin console password Strong random string
POSTGRES_PASSWORD PostgreSQL password Stored as secret
MONGO_URI MongoDB connection string mongodb://mongo:27017/blih
JWT_SECRET Signing secret for tokens 64+ character random
ENABLE_HR / ENABLE_CRM / etc. Module toggle flags true/false
AI_LLM_MODEL Local LLM path or model name e.g., "llama3:8b" (Ollama) 3. Build and Start Containers
docker-compose up -d --build
◦ This launches all services: Keycloak, MongoDB, PostgreSQL, MinIO, Qdrant, backend services, frontend, n8n. 4. Initial Setup
◦ Access Keycloak admin console: https://<host>:8443 (default credentials in .env).
◦ Create realm "blih-realm".
◦ Configure clients (web UI, backend services).
◦ Create initial admin user and roles. 5. Database Initialization & Migrations
docker exec -it blih-backend npm run migrate
docker exec -it blih-backend npm run seed:initial # Optional: seed sample data

    6. Module Activation
        ◦ Set module flags in .env and restart:
    docker-compose down && docker-compose up -d
    7. Verification
        ◦ Access UI: https://<host>
        ◦ Login with initial admin credentials.
        ◦ Verify: Dashboard loads, roles enforced, audit log records login.

5.3 Upgrades and Version Management 1. Pull Updates
git pull
docker-compose pull

    2. Apply Migrations
    docker exec -it blih-backend npm run migrate:up

    3. Restart Services
    docker-compose up -d --force-recreate

    4. Post-Upgrade Checks
        ◦ Verify audit continuity (no gaps).
        ◦ Test key workflows (e.g., deal win → project creation).
        ◦ Export audit log for compliance record (Appendix 8.6).

Rollback Procedure: Restore from tagged Docker images and database backup.

5.4 Configuration Best Practices
• Secrets Management: Use Docker secrets or external vault (e.g., HashiCorp Vault) in production.
• HTTPS Enforcement: Configure reverse proxy (Traefik/Nginx) with valid certificates.
• Backup Strategy:
◦ Daily MongoDB/PostgreSQL dumps.
◦ Weekly MinIO snapshots.
◦ Automated scripts (cron + Docker volume backups).
• Monitoring Integration: Enable Prometheus endpoints; optional Grafana dashboards.
• Air-Gapped Deployment:
◦ Pre-download all Docker images.
◦ Transfer via USB/offline medium.
◦ Disable external update checks.
• Licensing Validation: Offline key check per module (no internet required).
Post-Deployment Compliance Check (Appendix 8.6):
• Confirm RBAC enforcement.
• Verify central audit log population.
• Test AI Chatbot permission gating.
Successful deployment results in a secure, isolated BLIH instance ready for data population, user onboarding, and compliance evidence generation (see Appendix 8.11 for auditor walkthrough). 6. Usage Guide
This section provides practical, step-by-step guidance for end-users, administrators, and managers interacting with BLIH after deployment. It emphasizes intuitive workflows, role-based access, AI assistance, and compliance-aligned practices (e.g., evidence generation via audit trails; see Appendix 8.6).
6.1 User Onboarding and Authentication 1. Initial Access
◦ Navigate to the deployment URL (e.g., https://blih.company.local).
◦ Users are redirected to the Keycloak login portal.
◦ Authenticate with credentials provided by the administrator. 2. Role Assignment
◦ First login: Administrators assign roles via Core Platform → Users → Roles.
◦ Roles determine visible modules and permissions (RBAC enforcement; see Appendix 8.4).
◦ Example roles: Employee (self-service), Manager (approvals), HR Admin, Compliance Officer. 3. Personalization and Orientation
◦ Upon login, users land on a personalized dashboard showing relevant modules.
◦ Immediate AI Chatbot access (global icon) for guidance:
▪ Suggested first query: "Guide me through onboarding as a new employee."
◦ Complete mandatory training acknowledgments (HR module; supports ISO 9001 Clause 7.3 awareness).
Best Practice: Administrators should conduct brief orientation sessions demonstrating the AI Chatbot for process discovery.
6.2 Common Workflows
BLIH enforces standardized, auditable processes across modules (ISO 9001 Clause 8 operation; see Appendix 8.3).
6.2.1 Employee Onboarding (HR Module) 1. HR creates employee record → triggers onboarding checklist. 2. New employee logs in → sees self-service tasks (document upload, training enrollment). 3. Manager approves contract → event publishes to Finance (payroll setup). 4. Brain records decision rationale; AI Chatbot available for "How do I complete onboarding?"
6.2.2 Sales to Delivery Pipeline (CRM → Projects → Finance) 1. Sales user qualifies lead → creates deal in CRM pipeline. 2. Deal marked "Won" → auto-publishes event. 3. Projects module creates project with tasks/milestones. 4. Assignments made → time tracking begins. 5. Finance auto-generates invoice from deal data. 6. Brain logs patterns (e.g., common win reasons); audit trail captures full flow.
6.2.3 Leave Request and Approval 1. Employee submits leave request (HR self-service). 2. Workflow routes to manager → approval/denial with comments. 3. Approved → balance updated, calendar event created. 4. Notification sent; full action logged (Appendix 8.6).
6.2.4 Reporting a Nonconformity or Risk (Compliance) 1. Any user selects "Report Issue" (global or module-specific). 2. Form routes to CAPA (Appendix 8.9) or Risk Register (Appendix 8.8). 3. Assigned owner investigates → actions created (linked to Projects if needed). 4. Closure triggers verification and lessons learned in Brain.
6.2.5 Conducting a Management Review 1. Compliance officer opens Management Review template (Appendix 8.10) for the quarter. 2. Auto-populated inputs: KPIs, open CAPAs, critical risks. 3. Attendees add minutes and decisions. 4. Actions auto-create CAPA/Project tasks upon approval.
AI Assistance in Workflows:
The Chatbot is context-aware:
• In a form: "Why is this field required?"
• In a dashboard: "Summarize overdue tasks."
• In Brain: "Explain our information security policy."
6.3 Daily Operations and Best Practices
• Dashboard Usage: Primary entry point; customize widgets per role.
• Search and Navigation: Global search queries Brain + modules; AI Chatbot for natural-language questions.
• Document Access: All SOPs, policies via Brain → role-filtered and version-controlled.
• Notifications: Review in-app bell icon daily; configure email preferences.
• Mobile Responsiveness: Core UI works on tablets/phones for field users (e.g., time tracking).
6.4 Troubleshooting and Support
Common Issues and Resolutions
Issue Symptoms Resolution Steps
Login failure Redirect loop or invalid credentials Clear browser cache; verify Keycloak status (docker logs keycloak); contact admin
Module not visible Expected module missing from dashboard Check role assignments in Core Platform; restart browser
Workflow stuck Approval pending indefinitely Check notifications; verify assignee online; review audit log for errors
AI Chatbot unresponsive No response or error Verify Qdrant/LLM container status; check permission gating
Data not syncing across modules Event not triggering (e.g., deal win → no project) Review event bus logs; ensure RabbitMQ/Redis healthy
Diagnostic Commands (Administrator)
docker ps # Verify all containers running
docker logs <container> # Check specific service logs
docker exec -it blih-backend npm run health-check # System health script

Recovery Procedures
• Service Restart: docker-compose restart <service>
• Full Restore: Use backup scripts (Section 5.4) → restore databases → re-run migrations.
• Support Escalation: Email support@blih.com with audit log export (Appendix 8.6) for rapid diagnosis.
Compliance Note: All troubleshooting actions are logged in the central audit trail, ensuring traceability for ISO audits (Appendix 8.11).
This guide enables efficient, compliant daily use of BLIH while leveraging its built-in AI and automation for reduced training needs and consistent process execution.

7.  Maintenance and Extensibility
    This section outlines procedures for ongoing system maintenance, monitoring, performance optimization, and safe extensibility. All practices are designed to preserve security, auditability, and compliance alignment (ISO 9001:2015 Clause 8.1 operational planning & control; ISO/IEC 27001:2022 Annex A.8 technological controls; see Appendices 8.3–8.4).
    7.1 Monitoring and Health Checks
    7.1.1 Built-in Monitoring Tools
    • Docker Stats: Real-time container resource usage:

        docker stats

        • Container Logs: Centralized logging for diagnostics:
        docker logs <container_name> --tail 100 -f

        • Health Endpoints: Each service exposes /health (returns 200 OK if healthy).

    7.1.2 Recommended External Monitoring (Optional but Advised for Production)
    • Prometheus + Grafana:
    ◦ Enable exporters in Docker Compose (commented in default file).
    ◦ Pre-built dashboards for CPU, memory, database connections, event queue length.
    • Alerting: Integrate with notification service for thresholds (e.g., CPU >80%, MongoDB connection pool exhaustion).
    7.1.3 Key Metrics to Monitor
    Metric Source Threshold (Alert) Compliance Relevance
    Container CPU/Memory Docker stats >80% sustained Availability (ISO 27001 A.8)
    Audit Log Write Latency Backend service >500ms Evidence integrity (Appendix 8.6)
    Event Queue Backlog RabbitMQ/Redis >100 messages Process reliability (Appendix 8.3)
    Database Connection Pool MongoDB/PostgreSQL >90% utilized Performance & resilience
    AI Chatbot Response Time Backend logs >5s average User experience & availability
    Daily Check Recommendation: Run docker ps and review notification inbox.
    7.2 Backup and Recovery
    7.2.1 Backup Strategy
    • Frequency:
    ◦ Databases: Daily incremental + weekly full.
    ◦ MinIO files: Weekly snapshot.
    • Automated Scripts (provided in repository):
    ./scripts/backup-databases.sh # Dumps MongoDB & PostgreSQL
    ./scripts/backup-minio.sh # Sync to secondary volume

7.2.2 Recovery Procedure 1. Stop services: docker-compose down 2. Restore databases from latest dump. 3. Restore MinIO bucket if needed. 4. Run migrations: npm run migrate 5. Start services: docker-compose up -d 6. Verify via health checks and audit log continuity.
Test Recommendation: Quarterly recovery drill (supports business continuity planning; Appendix 8.5).
7.3 Updates and Patching
7.3.1 Routine Updates
• Dependency Patches: Monthly review of vulnerability scans (e.g., trivy on images).
• BLIH Version Upgrades: 1. Pull latest tagged release. 2. Review migration notes. 3. Apply database migrations. 4. Test in staging environment. 5. Deploy to production during maintenance window.

7.3.2 Security Patching
• Immediate action on critical vulnerabilities (CVSS ≥9).
• Use immutable tagged images for rollback.
Change Control: All updates logged as Brain decisions with rationale (ISO 9001 Clause 8.1).
7.4 Customization and Extensibility
7.4.1 Safe Customization Options
• New Modules: Follow standard directory structure; register in Core for RBAC and events.
• Custom Events: Extend event bus without breaking existing flows.
• UI Extensions: Next.js plugin system for custom dashboard widgets.
• Brain Patterns: Add new insight detectors via configuration.
• n8n Workflows: Visual builder for advanced automation (e.g., external API integrations).
7.4.2 Extension Guidelines (Preserve Compliance)
• Inherit RBAC permissions.
• Publish meaningful events for Brain observation.
• Log all significant actions to central audit trail.
• Version custom documents in Brain (Appendix 8.3 Clause 7.5).
7.4.3 Example: Adding a Custom Compliance Dashboard 1. Create new Next.js page under /pages/custom/compliance. 2. Pull data from Risk Register, CAPA, Management Review APIs. 3. Register route and permissions in Core. 4. Brain auto-observes usage patterns.
7.5 Support and Issue Resolution
7.5.1 Internal Support Process 1. User reports issue via built-in "Feedback" form → creates Brain entry + notification to admins. 2. Triage using audit logs and dashboards. 3. Resolution logged as CAPA if process-related (Appendix 8.9).

7.5.2 External Support
• Channel: support@blih.com
• Required Information:
◦ Timestamped description
◦ User role
◦ Audit log export (filtered; Appendix 8.6)
◦ Screenshots (if UI-related)
7.5.3 Release Cycle
• Quarterly minor releases (features + improvements).
• Monthly security patches.
• All changes announced with impact assessment.
Continual Improvement Integration: System issues feed directly into CAPA and Management Review cycles (Appendices 8.9–8.10), ensuring structured learning and enhancement (ISO 9001 Clause 10).
This maintenance framework ensures BLIH remains secure, performant, and extensible while generating auditable evidence of ongoing care and improvement.

8. Appendices
   8.1 Glossary
   This glossary provides definitions for key terms used throughout the BLIH System Documentation. Definitions are aligned with ISO/IEC 27001:2022 (Information security, cybersecurity and privacy protection — Information security management systems — Requirements) and the supporting ISO/IEC 27000 series standards. Emphasis is placed on information security management system (ISMS) principles, including the confidentiality, integrity, and availability (CIA) triad, risk management, and relevant controls from Annex A (e.g., A.5 Organizational controls, A.6 People controls, A.7 Physical controls, A.8 Technological controls). Terms are listed alphabetically.
   Access Control
   Rules and mechanisms that restrict access to information and information processing facilities to authorized users, entities, or processes only (aligned with Annex A.5.15 – Access control and related technological controls in A.8). In BLIH, this is implemented through role-based access control (RBAC) to enforce the principle of least privilege and prevent unauthorized access.
   Audit Trail
   A chronological record of system activities that enables the reconstruction and examination of events (aligned with Annex A.8.15 – Logging and A.8.16 – Monitoring activities). In BLIH, a central audit log provides immutable records of user actions, module interactions, timestamps, and associated details for compliance verification and incident investigation.
   Authentication
   The provision of assurance that a claimed characteristic of an entity is correct (e.g., via Keycloak in BLIH, supporting JSON Web Tokens (JWT) and offline capabilities).
   Availability
   The property of being accessible and usable upon demand by an authorized entity (part of the CIA triad). In BLIH, availability is ensured through Docker-based scalability, event-driven resilience, and optional Redis caching.
   Confidentiality
   The property that information is not made available or disclosed to unauthorized individuals, entities, or processes (part of the CIA triad). In BLIH, confidentiality is protected through encryption at rest and in transit, RBAC, and permission gating for AI interactions.
   Cryptographic Controls
   Measures employing cryptography to protect the confidentiality, integrity, and authenticity of information (aligned with Annex A.8.24 – Use of cryptography). In BLIH, these include encryption at rest (database configurations, MinIO), in transit (HTTPS), and key management for files and sensitive data.

Encryption
The process of converting information into a form that is unintelligible without the appropriate cryptographic keys. In BLIH, encryption is applied to data at rest (e.g., MinIO, databases) and in transit to mitigate risks of unauthorized disclosure.
Event-Driven Architecture
A design paradigm that promotes the production, detection, consumption, and reaction to events, enabling loose coupling. In BLIH, this supports integrations while maintaining auditability and resilience.
Information Security
The preservation of confidentiality, integrity, and availability of information; may also include authenticity, accountability, non-repudiation, and reliability.
Information Security Management System (ISMS)
A systematic approach to managing sensitive information, encompassing people, processes, and IT systems (core of ISO/IEC 27001:2022). BLIH's modular design, RBAC, audit logging, and encryption support ISMS implementation in on-premises deployments.
Integrity
The property of accuracy and completeness (part of the CIA triad). In BLIH, integrity is maintained through immutable audit logs, ACID transactions in PostgreSQL, and versioned knowledge in the Brain module.
Least Privilege
The principle of granting users only the access rights necessary for their tasks (embedded in RBAC implementations).
Logging and Monitoring
The recording and review of events to detect anomalies and support incident response (aligned with Annex A.8.15 and A.8.16). In BLIH, central audit and notification services provide evidence for internal and external audits.
Risk Management
Coordinated activities to direct and control an organization with regard to risk. BLIH's design (module isolation, event-driven decoupling) facilitates risk treatment through selected controls.
Role-Based Access Control (RBAC)
An access control policy that restricts system access based on roles assigned to users (implementation of Annex A.5.15). In BLIH, granular permissions (e.g., MODULE:RESOURCE:ACTION) enforce segregation of duties and least privilege.
Standard Operating Procedure (SOP)
A documented process that ensures consistent operations. In the BLIH Brain module, versioned SOPs support knowledge continuity and provide compliance evidence.
8.2 References
This section lists authoritative sources that support BLIH's alignment with ISO/IEC 27001:2022. These resources assist auditors, implementers, and stakeholders in verifying controls (e.g., access control, logging, cryptography) and preparing Statements of Applicability (SoA). Links are accurate as of January 05, 2026.
Core ISO/IEC 27000 Family Standards
• ISO/IEC 27001:2022 – Information security, cybersecurity and privacy protection — Information security management systems — Requirements
https://www.iso.org/standard/27001
Specifies ISMS requirements, including risk assessment, control selection from Annex A, and continual improvement. BLIH's RBAC, audit logging, and encryption align with Clauses 6 (Planning), 8 (Operation), and Annex A controls.
• ISO/IEC 27000:2018 – Information security management systems — Overview and vocabulary
https://www.iso.org/standard/73906.html
Provides foundational terms and an ISMS overview; essential for consistent audit terminology.
• ISO/IEC 27002:2022 – Information security controls
https://www.iso.org/standard/75652.html
Offers detailed guidance on implementing Annex A controls (e.g., A.5.15 Access control, A.8.15 Logging, A.8.24 Cryptography). Supports BLIH's technological and organizational controls.
Technology References (Supporting Control Implementation)
• NestJS Official Documentation: https://docs.nestjs.com/
Backend framework enabling secure, auditable services.
• Next.js Official Documentation: https://nextjs.org/docs
Frontend framework for role-aware, secure interfaces.
• Keycloak Official Documentation: https://www.keycloak.org/documentation
Identity management supporting RBAC and authentication controls.
Compliance and Regional References
• Ethiopia Ministry of Revenues – Tax Regulations and Guidelines
https://www.mor.gov.et/web/mor/regulations
Relevant for compliance in the Finance module (e.g., payroll deductions, withholding taxes).
• Value Added Tax (VAT) Proclamation (Ethiopia)
https://www.mofed.gov.et/media/filer_public/.../vat_proclamation_latest_draft-_english_-2023_1.pdf
Guides tax calculations and reporting in the BLIH Finance module.
Auditors should consult the latest editions for certification evidence. BLIH's design facilitates SoA justification and nonconformity resolution through documented controls and audit trails.

8.3 ISO 9001:2015 Process-to-Module Mapping Table
The following table maps key ISO 9001:2015 clauses and associated processes to corresponding BLIH modules. It demonstrates how the system operationalizes the Quality Management System (QMS), providing evidence for process definition, standardization, execution, monitoring, and continual improvement in alignment with Clause 8 (Operation) and the PDCA cycle.
ISO 9001:2015 Clause Key Process / Requirement BLIH Module(s) How BLIH Operationalizes the Process Audit Evidence Generated 4. Context of the Organization<br>4.1 Understanding the organization and its context<br>4.4 Quality management system and its processes Determination of internal processes, organizational structure, and QMS scope Core Platform<br>BLIH Brain Single company_id context; Company structure and roles/responsibilities pages in Brain Organizational overview pages; Audit logs of structure updates 5. Leadership<br>5.1 Leadership and commitment<br>5.3 Organizational roles, responsibilities and authorities Leadership commitment; Assignment of roles and authorities Core Platform (RBAC)<br>BLIH Brain Granular role-based permissions; Role registry and responsibilities documentation Role assignment logs; Audit trails of authority exercises (e.g., approvals) 6. Planning<br>6.1 Actions to address risks and opportunities<br>6.2 Quality objectives and planning to achieve them Risk-based planning; Setting and planning quality objectives BLIH Projects<br>BLIH CRM<br>BLIH Brain Project planning, milestones, and risk tracking; CRM pipeline forecasting; Decision rationale and pattern recording Documented plans; KPI dashboards; Brain decision records 7. Support<br>7.1 Resources<br>7.2 Competence<br>7.3 Awareness<br>7.5 Documented information Resource allocation; Competence management; Training and awareness; Control of documented information BLIH Team (HR)<br>BLIH Brain<br>AI Chatbot Employee profiles, skills, training assignments/completions; Versioned SOPs and policies; Role-aware knowledge guidance Training records; SOP version history; AI interaction logs 8. Operation<br>8.1 Operational planning and control<br>8.2 Requirements for products and services<br>8.3 Design and development<br>8.5 Production and service provision<br>8.7 Control of nonconforming outputs Planning, execution, and control of core operational processes (HR, sales, delivery, finance, knowledge) BLIH Team (HR)<br>BLIH CRM<br>BLIH Projects<br>BLIH Finance<br>BLIH Brain Automated workflows for employee lifecycle, deal pipelines, project tasks/milestones, financial transactions, and knowledge capture Workflow execution logs; Approval chains; Immutable audit trails per record 9. Performance Evaluation<br>9.1 Monitoring, measurement, analysis and evaluation<br>9.2 Internal audit<br>9.3 Management review Monitoring KPIs; Data analysis; Management review inputs All Modules (Dashboards)<br>Core Platform (Audit Logs)<br>BLIH Brain Real-time module dashboards; Central audit logs; Trend analysis and insights KPI reports; Historical data exports; Brain pattern/insight records 10. Improvement<br>10.2 Nonconformity and corrective action<br>10.3 Continual improvement Identification of nonconformities; Corrective actions; Systematic improvement BLIH Brain<br>BLIH Projects<br>All Modules (via Audit & Feedback) Lessons learned repository; Decision rationale versioning; Process improvement tracking Lessons learned entries; Corrective action workflows; Versioned process updates
Notes for Auditors: All processes are system-enforced, ensuring consistency and repeatability (Clause 8.1). Traceability is provided via central immutable audit logs capturing user, action, module, record, and timestamp (supports Clauses 7.5, 9.1, 10.2). Continual improvement is embedded through the Brain module's passive observation and AI-supported analysis (Clause 10.3). BLIH automates and standardizes core processes (HR, Finance, Marketing/CRM, Project Management, Company Knowledge Base), providing objective evidence of QMS effectiveness. This mapping may be included in the organization's Quality Manual or Statement of Applicability.
8.4 ISO/IEC 27001:2022 Annex A Control Mapping to BLIH Controls
The following table maps selected ISO/IEC 27001:2022 Annex A controls (organized by the four themes) to corresponding BLIH features and controls. It demonstrates implementation of baseline information security controls, generation of objective evidence, and support for risk treatment.
• Implemented: Directly enforced or supported by BLIH.
• Partially Supported: BLIH provides technical evidence but requires complementary organizational measures.
• Client Responsibility: Applies to physical or supplier-specific controls in on-premises deployments.

Annex A Control (2022) Control Objective BLIH Implementation Status Audit Evidence Generated
A.5 Organizational controls
A.5.1 Information security policies Establish high-level policies Brain: Versioned policy documents with approval workflow and role-based visibility Implemented Policy version history, access logs
A.5.15 Access control Limit access to information and systems Core Platform RBAC with granular permissions (MODULE:RESOURCE:ACTION) Implemented Role/permission matrices, audit trails of access attempts
A.5.16 Identity management Manage user identities Keycloak integration: User provisioning, identity lifecycle Implemented User creation/deactivation logs
A.5.17 Authentication information Secure allocation and management of credentials Keycloak: JWT, password policies, offline token support Implemented Authentication event logs
A.5.18 Access rights Grant and review access rights RBAC role assignment + periodic review support via HR integration Implemented Role assignment audit trails
A.5.37 Documented operating procedures Define and maintain operating procedures Brain: Versioned SOP library with approval and visibility controls Implemented SOP version logs, access records
A.6 People controls
A.6.3 Information security awareness, education and training Ensure personnel awareness and competence BLIH Team (HR): Training assignments, completion tracking; AI Chatbot: Role-aware guidance Implemented Training records, completion certificates, AI interaction logs
A.6.6 Confidentiality or non-disclosure agreements Protect information through agreements Brain/File storage: Template storage for contracts; HR contract management Partially Supported Stored contract versions, access logs
A.7 Physical controls
A.7.1–A.7.14 (Physical security perimeter, entry controls, etc.) Protect against physical threats On-premises deployment model (client-managed server) Client Responsibility N/A
A.8 Technological controls
A.8.1 User endpoint devices Secure user devices Client-managed endpoints; BLIH supports HTTPS and JWT Partially Supported Session logs
A.8.3 Information access restriction Restrict access to information RBAC + module-level permissions + Brain role-based visibility Implemented Access denial logs, file/document visibility settings
A.8.9 Configuration management Secure system configuration Docker-based immutable containers; versioned deployments Implemented Deployment logs, container image versioning
A.8.15 Logging Record events for monitoring Central immutable audit log (user, module, action, record, timestamp) Implemented Full audit trail exportable for review
A.8.16 Monitoring activities Detect anomalous behaviour Audit logs + notification service; Brain pattern observation Implemented Log exports, notification records
A.8.24 Use of cryptography Protect confidentiality, integrity, authenticity Encryption at rest (MinIO, database configs); Encryption in transit (HTTPS); Key management support Implemented Configuration evidence, encrypted storage verification
A.8.25 Secure development lifecycle Ensure secure development Modular design, code isolation, versioned APIs Partially Supported Internal development evidence (outside BLIH runtime)
A.8.28 Secure coding Apply secure coding principles NestJS/Next.js best practices (input validation, etc.) Partially Supported Code review records (client process)
A.8.34 Protection against AI-based attacks Mitigate AI-specific risks AI Chatbot: No raw DB access; Uses only Brain-approved content; Permission-checked responses; Logged queries Implemented AI interaction audit logs, permission check records
Notes for Auditors and Statement of Applicability (SoA): BLIH provides technical and procedural controls for Organizational (A.5), People (A.6), and most Technological (A.8) themes, directly supporting approximately 40% of Annex A controls in typical on-premises deployments. Physical controls (A.7) are the responsibility of the deploying organization. Partially supported controls require complementary organizational processes. All implemented controls generate objective, timestamped evidence (audit logs, version histories, role assignments) exportable for audits. This mapping may be referenced in the organization's SoA as justification for selected controls.

8.5 BLIH Coverage vs. Organizational Responsibilities
This section defines the boundary between system-provided capabilities in BLIH and organizational responsibilities. This distinction is essential for certification audits, as BLIH operationalizes many controls but does not replace management commitment or full ISMS/QMS governance.
Category What BLIH Covers (System-Provided) What Must Be Done Organizationally (Outside BLIH) Rationale & Audit Implication
Leadership & Commitment<br>(ISO 9001 Clause 5.1; ISO 27001 Clause 5) Enforces role-based accountability via RBAC and audit trails<br>Provides visibility into roles/responsibilities (Brain) Top management must define quality/security policy<br>Demonstrate active leadership (e.g., management reviews, resource allocation)<br>Communicate policy and objectives BLIH provides evidence of execution; leadership intent and oversight remain organizational.
Risk Assessment & Treatment<br>(ISO 9001 Clause 6.1; ISO 27001 Clause 6) Supports risk identification via Brain patterns/lessons<br>Reduces common risks through built-in controls Conduct formal risk assessment<br>Maintain risk treatment plan and SoA<br>Review risks periodically BLIH mitigates known risks but does not perform the formal process.
Policy Definition & Approval<br>(ISO 27001 A.5.1; ISO 9001 Clause 5.2) Stores and versions policies/SOPs in Brain<br>Controls access and enforces visibility Management must author, approve, and review high-level policies<br>Ensure communication and understanding BLIH is the repository and enforcement tool; policy creation and ownership are organizational.
Objectives & Planning<br>(ISO 9001 Clause 6.2; ISO 27001 Clause 6.2) Tracks objectives via Projects/HR OKRs<br>Provides dashboards for monitoring Define measurable objectives<br>Integrate into business planning BLIH supports tracking; objective setting and alignment are management responsibilities.
Resource Provision<br>(ISO 9001 Clause 7.1; ISO 27001 implied) On-premises model provides full control over hardware/software resources Provide and maintain infrastructure (servers, backups, physical security)<br>Allocate human and financial resources BLIH runs on client-provided infrastructure.
Competence & Training<br>(ISO 9001 Clause 7.2; ISO 27001 A.6.3) Records training assignments and completions (HR module)<br>Delivers role-aware guidance (AI Chatbot) Determine required competence<br>Evaluate training effectiveness<br>Maintain awareness program BLIH automates recording and delivery; evaluation and program design are organizational.
Operational Processes<br>(ISO 9001 Clause 8) Fully automates and standardizes HR, CRM, Projects, Finance, Knowledge Base<br>Enforces workflows and generates audit trails Define additional processes outside BLIH scope<br>Monitor outsourced processes BLIH covers specified core processes; others remain manual or external.
Internal Audit & Management Review<br>(ISO 9001/27001 Clauses 9.2–9.3) Provides complete audit logs, dashboards, and exportable data<br>Brain insights support analysis Plan and conduct independent audits<br>Hold formal management reviews<br>Document conclusions and actions BLIH supplies evidence; execution and review are organizational.
Nonconformity & Corrective Action<br>(ISO 9001 Clause 10.2; ISO 27001 Clause 10) Captures issues via lessons learned (Brain)<br>Logs all actions for traceability Investigate root causes<br>Determine and implement corrective actions<br>Verify effectiveness BLIH records events; formal investigation and closure are organizational.
Physical & Environmental Security<br>(ISO 27001 Annex A.7) None (on-premises deployment) Secure physical perimeter, entry controls, cabling, equipment maintenance, clear desk/screen BLIH is software-only; physical controls are fully organizational.
Supplier & Third-Party Management<br>(ISO 27001 A.5.19–A.5.22) Minimal (e.g., Docker images from trusted sources) Assess and monitor suppliers<br>Include security requirements in agreements BLIH has few dependencies; supplier risk remains organizational.
Incident Management<br>(ISO 27001 A.5.26, A.16) Logs security-relevant events<br>Notification service for alerts Define incident response process<br>Report and learn from incidents<br>Test plan BLIH provides detection evidence; response process and execution are organizational.
Business Continuity<br>(ISO 27001 A.5.29–A.5.30) Supports availability via module isolation and on-prem control<br>Backup-capable databases/files Develop, test, and maintain BCP/DR plan<br>Conduct exercises BLIH aids resilience; full planning is organizational.
Summary Statement: BLIH covers technical implementation, automation of core processes, baseline security controls, evidence generation, and operational enforcement. Organizational responsibilities include governance (leadership, policy-making, risk assessment, audits, reviews), physical security, supplier management, incident response planning, business continuity, and processes outside the core areas. BLIH reduces compliance effort by operationalizing controls and generating evidence automatically, but certification requires demonstrable management commitment and formal processes.

8.6 ISO Evidence Checklist Generated from BLIH Data
This checklist identifies key objective evidence required for ISO 9001:2015 and ISO/IEC 27001:2022 certification, indicating how BLIH automatically generates most items. Items marked BLIH-Generated are directly exportable/viewable; Organizational + BLIH require minimal manual input supplemented by system evidence.
Section 1: ISO 9001:2015 Evidence Checklist
Clause Required Evidence Source in BLIH BLIH-Generated? Example Export/View
4.1–4.4 Context of the organization; QMS processes and scope Brain → Company Structure & Roles pages; Core company profile Yes Export Brain structure pages; Screenshot company context
5.1–5.3 Leadership commitment; Roles, responsibilities, authorities RBAC role registry; Audit trails of approvals/decisions Yes Role-permission matrix report; Approval workflow logs
6.1–6.2 Risks/opportunities addressed; Quality objectives Projects/CRM plans; Brain decision rationales; HR OKRs Yes KPI dashboards; Brain risk pattern reports
7.1–7.3 Resources, competence, awareness HR employee profiles, training records Yes Training completion report; Skills matrix export
7.5 Documented information control Brain SOPs/policies (versioned); File metadata in MinIO Yes SOP version history log; Document access report
8.1–8.7 Operational planning and control (core processes) All modules: Workflow execution records Yes Full audit trail per process; Workflow status reports
9.1 Monitoring, measurement, analysis Module dashboards; Brain insights Yes KPI performance reports; Trend analysis exports
9.2 Internal audit results Central audit logs used as input Organizational + BLIH Audit log exports + manual audit report
9.3 Management review inputs/outputs Dashboards + logs as evidence Organizational + BLIH Management review minutes referencing BLIH reports
10.2–10.3 Nonconformity, corrective action, continual improvement Brain lessons learned; Decision versioning Yes Lessons learned repository export; Improvement tracking report

Section 2: ISO/IEC 27001:2022 Evidence Checklist (Selected Key Controls)
Clause / Annex A Required Evidence Source in BLIH BLIH-Generated? Example Export/View 5. Leadership Information security policy & objectives Brain policy documents Yes Approved policy versions 6. Planning Risk assessment & treatment plan Brain patterns (input); Manual risk register Organizational + BLIH Risk patterns report + organizational SoA 8. Operation Implemented controls All technical controls (RBAC, logging, etc.) Yes Control status dashboard (custom) 9. Performance Monitoring & measurement Audit logs; Notification history Yes Security event summary report
9.2 Internal audit Audit programme & results Logs as evidence base Organizational + BLIH Audit log extracts
9.3 Management review Review inputs/outputs Logs + dashboards Organizational + BLIH Review minutes referencing BLIH data 10. Improvement Nonconformity & corrective action Brain lessons learned Yes Corrective action tracking from Brain
A.5.1 Approved security policies Brain policy library Yes Policy approval workflow log
A.5.15 Access control policy & rules RBAC configuration Yes Permission matrix export
A.5.16–A.5.18 User registration, privilege management Keycloak user logs; RBAC assignments Yes User access review report
A.5.37 Operating procedures Brain SOPs Yes SOP version and access report
A.6.3 Awareness/training HR training module Yes Employee training completion report
A.8.3 Access based on business needs RBAC + file visibility Yes Access denial logs
A.8.15–A.8.16 Event logging and review Central audit log Yes Full audit trail export
A.8.24 Use of encryption MinIO/database encryption config Yes Configuration evidence + encryption status report
AI Safety Controls over AI use AI Chatbot permission checks Yes AI query log with permission outcomes

How to Generate Evidence from BLIH Data:
• Audit Log Export: Core Platform → Export filtered audit trail (CSV/JSON).
• Brain Reports: Export SOP versions, lessons learned, decision rationales, policy approvals.
• HR Training Report: BLIH Team → Training completions and assignments.
• RBAC Matrix: Core Platform → Export role-permission mappings and user assignments.
• Dashboards & KPIs: All modules → Exported reports or screenshots.
• File/Document Report: Brain/MinIO metadata → Access and version history.
• Custom Compilation: Combine exports into an audit package.
Summary for Auditors: Approximately 80% of required objective evidence is automatically generated and timestamped by BLIH. The remaining 20% requires organizational input but is supported by BLIH data. All core evidence is centralized, immutable, and exportable, reducing audit preparation time and nonconformity risk.
8.7 Risk Register Data Model & UI Design (ISO/IEC 27001 Clause 6 Compliant)
The Risk Register is implemented natively in the BLIH Brain module as a structured, versioned, role-visible knowledge collection—fully auditable, AI-queryable, and exportable.
8.7.1 Data Model (MongoDB Collection in Brain Module)
Collection Name: risks
Document Structure:
{
"\_id": ObjectId,
"risk_id": String, // e.g., "RISK-001" (auto-generated, unique)
"title": String,
"description": String,
"asset": {
"name": String,
"category": String,
"owner": String
},
"threat": {
"name": String,
"source": String
},
"vulnerability": {
"name": String,
"description": String
},
"likelihood": Number, // 1–5
"impact": Number, // 1–5
"inherent_risk_score": Number, // Auto: likelihood × impact
"existing_controls": [
{
"control_id": String,
"description": String,
"effectiveness": Number // 1–5
}
],
"residual_risk_score": Number, // Auto-calculated
"risk_level": String, // Low/Medium/High/Critical
"treatment": {
"option": String, // Accept/Mitigate/Avoid/Transfer
"actions": [
{
"description": String,
"owner": String,
"due_date": Date,
"status": String
}
],
"target_residual_score": Number
},
"status": String,
"review_date": Date,
"last_reviewed": Date,
"created_by": String,
"created_at": Date,
"updated_by": String,
"updated_at": Date,
"tags": [String],
"related_risks": [ObjectId]
}

RBAC Permissions: RISK:view, RISK:create/edit, RISK:approve, RISK:audit.
8.7.2 UI Design
• Risk Register Dashboard (/brain/risks): Heatmap, summary cards, filters.
• Risk List Table: Columns for RISK-ID, Title, Asset, Scores, Risk Level, Status, Owner, Next Review.
• Risk Detail Page: Tabs for Overview, Controls, Treatment Plan, History.
• Create/Edit Form: Wizard with auto-score preview.
• Reports: Full register export (PDF/CSV), high-risk summary.
Implementation Effort: Approximately 2 weeks.
8.8 Lightweight CAPA Lifecycle Module (ISO 9001 Clause 10.2 Compliant)
The Corrective and Preventive Action (CAPA) process extends the BLIH Brain and Projects modules.
8.8.1 CAPA Lifecycle Stages 1. Identification 2. Logging 3. Evaluation 4. Root Cause Analysis 5. Action Planning 6. Implementation 7. Verification 8. Closure

8.8.2 Data Model (MongoDB Collection in Brain Module)
Collection Name: capas
Document Structure:
{
"\_id": ObjectId,
"capa_id": String, // "CAPA-2026-001"
"title": String,
"description": String,
"type": String, // Corrective / Preventive
"source": String,
"detected_date": Date,
"detected_by": String,
"impact": {
"description": String,
"severity": String
},
"root_cause": {
"analysis": String,
"concluded": Boolean,
"concluded_date": Date,
"analyst": String
},
"actions": [
{
"action_id": String,
"description": String,
"type": String,
"owner": String,
"due_date": Date,
"status": String,
"project_task_link": ObjectId
}
],
"verification": {
"method": String,
"evidence": String,
"verified_by": String,
"verified_date": Date,
"effective": Boolean
},
"status": String,
"closure_date": Date,
"closed_by": String,
"lessons_learned_link": ObjectId,
"related_risks": [ObjectId],
"created_by": String,
"created_at": Date,
"updated_by": String,
"updated_at": Date,
"tags": [String]
}

RBAC Permissions: CAPA:view, CAPA:create, CAPA:edit/root_cause, CAPA:verify/close.
8.8.3 UI Design
• CAPA Dashboard (/brain/capa): Summary cards, trend chart.
• CAPA List Table: Columns for CAPA-ID, Title, Source, Severity, Status, Owner.
• CAPA Detail Page: Progress bar, sections for Issue, Root Cause, Actions, Verification.
• Create CAPA Form: Triggered from modules.
Implementation Effort: Approximately 1.5–2 weeks.

8.9 Management Review Template (ISO 9001 & ISO/IEC 27001 Clause 9.3 Compliant)
The Management Review evaluates QMS/ISMS performance using live data from CAPA, Risk Register, and KPIs.
8.9.1 Data Model (Brain Module)
Collection: management_reviews
Document Structure:

    {

"\_id": ObjectId,
"review*id": String, // "MR-2026-Q1"
"period": String,
"review_date": Date,
"actual_date": Date,
"status": String,
"attendees": [String],
"chair": String,
"agenda_inputs": {
"performance_kpis": { /* auto-populated _/ },
"capa_status": { /_ auto-populated _/ },
"risk_status": { /_ auto-populated \_/ },
"customer_feedback": String,
"audit_results": String,
"changes": String,
"resource_needs": String,
"previous_actions": String
},
"discussion_notes": String,
"outputs": {
"decisions": [String],
"actions": [ /* with owner, due_date, capa_link */ ],
"resource_approvals": [String],
"policy_updates_needed": [String]
},
"approval": {
"approved_by": String,
"approved_date": Date
},
"created_by": String,
"created_at": Date,
"updated_at": Date
}

8.9.2 UI Design
• Management Reviews Dashboard (/brain/management-reviews): Calendar, summary cards.
• Review List Table: Columns for Review ID, Period, Status, Chair.
• Review Detail Page: Auto-populated inputs (KPIs, CAPA/Risk stats), minutes, outputs table.
• Create Review: Quarterly trigger with pre-filled inputs.
Implementation Effort: Approximately 1 week.

8.10 Auditor Walkthrough Scenario (Using BLIH Only)
This scenario illustrates a simulated ISO 9001:2015 and ISO/IEC 27001:2022 audit conducted entirely within BLIH, without external documents.
Scenario Date: April 15, 2026
Participants: External Auditor, Quality Manager (QM), Compliance Officer (CO)
Walkthrough Steps 1. System Overview: Login → Dashboard → Demonstrate role-based visibility. 2. Policies: Brain → Policies → Display Quality & Information Security Policies (version history, approvals); AI Chatbot explains policy content. 3. Risk Management: Brain → Risk Register → Dashboard, heatmap, detail view of a critical risk (scores, controls, treatment). 4. Nonconformity & Improvement: Brain → CAPA → Dashboard, detail view of a closed CAPA (root cause, actions, verification, lessons learned). 5. Performance & Management Review: Brain → Management Reviews → Q1 2026 review (auto-populated inputs from KPIs/CAPA/Risk, minutes, decisions, actions). 6. Audit Trail: Core → Audit Log → Filtered views (e.g., changes to high-risk entry or CAPA closure).
Simulated Auditor Conclusion:
"All mandatory evidence was accessible directly in BLIH—policies, risks, CAPA, management reviews, audit trails. This represents a mature, integrated QMS/ISMS implementation."
Evidence Summary Table
Requirement Location in BLIH Demonstrated?
Policies Brain → Policies Yes
Risk Register Brain → Risk Register Yes
CAPA Lifecycle Brain → CAPA Yes
Management Review Brain → Management Reviews Yes
KPIs & Performance Dashboards + Review Inputs Yes
Audit Trail Core → Audit Log Yes
RBAC Enforcement System-wide Yes
AI Guidance AI Chatbot Yes
This scenario confirms BLIH as a comprehensive compliance evidence platform, enabling efficient audits with no external artifacts.

---

## 3. Implementation Guide

### 3.1 System Requirements

**Minimum Hardware Requirements:**
| Component | Minimum | Recommended | Purpose |
|-----------|-----------|-------------|---------|
| **CPU** | 8 cores | 16 cores | Application processing |
| **Memory** | 16 GB RAM | 32 GB RAM | Application and cache |
| **Storage** | 500 GB SSD | 2 TB SSD | Database and logs |
| **Network** | 1 Gbps | 10 Gbps | Internal communication |
| **Backup** | 1 TB external | 5 TB external | Disaster recovery |

**Software Dependencies:**
| Software | Version | Purpose |
|----------|----------|---------|
| **Docker** | 20.10+ | Container runtime |
| **Docker Compose** | 2.0+ | Multi-container orchestration |
| **PostgreSQL** | 15.x | Core database |
| **MongoDB** | 6.0+ | Business modules data |
| **Redis** | 7.x | Caching and sessions |
| **RabbitMQ** | 3.12+ | Message broker |
| **Elasticsearch** | 8.8+ | Audit log search |
| **Keycloak** | 22.x | Identity management |

**Network Requirements:**

- **Internal Ports:** 3000 (API), 8080 (Keycloak), 5672 (RabbitMQ), 6379 (Redis)
- **External Ports:** 443 (HTTPS), 80 (HTTP redirect)
- **Bandwidth:** Minimum 100 Mbps internal, 50 Mbps external
- **Latency:** < 10ms internal, < 100ms external

### 3.2 Installation Process

**Step 1: Environment Preparation**

```bash
# 1.1 Create installation directory
sudo mkdir -p /opt/blih
cd /opt/blih

# 1.2 Create required directories
mkdir -p {data,logs,backups,config,ssl}

# 1.3 Set permissions
sudo chown -R blih:blih /opt/blih
chmod 755 /opt/blih

# 1.4 Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker blih

# 1.5 Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**Step 2: Configuration Setup**

```bash
# 2.1 Create environment file
cp .env.example .env

# 2.2 Edit configuration
nano .env
```

**Critical Configuration Items:**

```bash
# Security Settings
JWT_SECRET=generate_32_character_random_string
DB_PASSWORD=generate_secure_password
KEYCLOAK_PASSWORD=generate_admin_password

# Database Settings
DATABASE_URL=postgresql://blih_user:YOUR_PASSWORD@postgres:5432/blih_core
MONGODB_URL=mongodb://blih_user:YOUR_PASSWORD@mongo:27017/blih_modules

# Email Configuration (Required for notifications)
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=noreply@yourcompany.com
SMTP_PASSWORD=your_smtp_password

# Domain Configuration
DOMAIN=yourcompany.com
SSL_CERT_PATH=/opt/blih/ssl/cert.pem
SSL_KEY_PATH=/opt/blih/ssl/key.pem
```

**Step 3: SSL Certificate Setup**

```bash
# 3.1 Generate self-signed certificate (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /opt/blih/ssl/key.pem \
  -out /opt/blih/ssl/cert.pem \
  -subj "/C=ET/ST=Addis Ababa/L=Addis Ababa/O=Your Company/CN=yourcompany.com"

# 3.2 OR use Let's Encrypt (for production)
sudo apt install certbot
sudo certbot certonly --standalone -d yourcompany.com
sudo cp /etc/letsencrypt/live/yourcompany.com/fullchain.pem /opt/blih/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourcompany.com/privkey.pem /opt/blih/ssl/key.pem
```

**Step 4: System Deployment**

```bash
# 4.1 Download BLIH containers
docker-compose pull

# 4.2 Start services
docker-compose up -d

# 4.3 Verify startup
docker-compose ps
docker-compose logs -f
```

**Step 5: Initial Configuration**

```bash
# 5.1 Access Keycloak Admin Console
# URL: https://yourcompany.com:8080/admin
# Username: admin
# Password: [configured in .env]

# 5.2 Create BLIH Realm
# - Realm Name: blih
# - Realm Settings: Enabled, Access Token Lifespan: 900 seconds

# 5.3 Create Client Applications
# - Core API: access-type=confidential, service-accounts-enabled=true
# - Frontend: access-type=public, redirect-uri=https://yourcompany.com/*

# 5.4 Create Initial Users
# - Create admin user with all roles
# - Create test users for each department
```

### 3.3 Database Initialization

**PostgreSQL Core Database:**

```sql
-- 3.3.1 Create databases
CREATE DATABASE blih_core;
CREATE DATABASE blih_audit;
CREATE DATABASE blih_notifications;

-- 3.3.2 Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 3.3.3 Initialize core tables
-- (Tables are created automatically by migrations)

-- 3.3.4 Create initial organization
INSERT INTO organizations (id, name, code, domain, timezone, currency, language, settings)
VALUES (
  gen_random_uuid(),
  'Your Company Name',
  'COMPANY',
  'yourcompany.com',
  'Africa/Addis_Ababa',
  'ETB',
  'en',
  '{"mfaRequired": true, "sessionTimeout": 480}'
);
```

### 3.4 Monitoring Setup

**Prometheus Configuration:**

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'blih-core'
    static_configs:
      - targets: ['api-gateway:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093
```

### 3.5 Backup and Recovery

**Automated Backup Script:**

```bash
#!/bin/bash
# /opt/blih/scripts/backup.sh

set -e

BACKUP_DIR="/opt/blih/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR/$DATE

echo "Starting backup: $DATE"

# PostgreSQL Backup
echo "Backing up PostgreSQL..."
docker exec blih_postgres_1 pg_dump -U blih_user blih_core > $BACKUP_DIR/$DATE/postgres_core.sql

# Compress Backup
echo "Compressing backup..."
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz -C $BACKUP_DIR $DATE
rm -rf $BACKUP_DIR/$DATE

# Cleanup Old Backups
echo "Cleaning up old backups..."
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

### 3.6 Security Hardening

**System Security:**

```bash
# 3.6.1 Firewall Configuration
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 5432/tcp  # PostgreSQL (internal only)
```

### 3.7 Troubleshooting Guide

**Common Issues and Solutions:**

| Issue                          | Symptoms                           | Solution                                                 |
| ------------------------------ | ---------------------------------- | -------------------------------------------------------- |
| **Services won't start**       | Docker containers exit immediately | Check .env file for missing required variables           |
| **Database connection failed** | "Connection refused" errors        | Verify PostgreSQL is running and credentials are correct |
| **Authentication fails**       | Login redirects or 401 errors      | Check Keycloak configuration and JWT secret              |
| **Slow performance**           | API response times > 2 seconds     | Check database indexes and cache hit rates               |

**Health Check Commands:**

```bash
# Check service status
curl -f https://yourcompany.com/api/v1/core/health

# Check database connectivity
docker exec blih_postgres_1 psql -U blih_user -c "SELECT 1;"

# Check Redis
docker exec blih_redis_1 redis-cli ping
```

---

## 4. Operational Procedures

### 4.1 Daily Operations Checklist

**Morning Checks (8:00 AM):**

- [ ] Verify all services are running
- [ ] Check system health dashboard
- [ ] Review overnight error logs
- [ ] Verify backup completion
- [ ] Check disk space usage
- [ ] Monitor system performance metrics

**Weekly Tasks (Friday 4:00 PM):**

- [ ] Review user access changes
- [ ] Analyze security logs for anomalies
- [ ] Update system patches
- [ ] Test backup restoration
- [ ] Review performance trends
- [ ] Clean up old log files

### 4.2 Incident Response Procedures

**Severity Classification:**

- **Critical:** System down, data breach, security incident
- **High:** Major feature unavailable, performance degradation
- **Medium:** Partial functionality loss, user impact
- **Low:** Minor issues, cosmetic problems

**Response Timeline:**

- **Critical:** 15 minutes acknowledgement, 1 hour resolution
- **High:** 30 minutes acknowledgement, 4 hours resolution
- **Medium:** 1 hour acknowledgement, 24 hours resolution
- **Low:** 4 hours acknowledgement, 72 hours resolution
