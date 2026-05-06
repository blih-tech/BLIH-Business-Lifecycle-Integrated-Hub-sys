# BLIH CRM Module - Feature & User Experience Documentation

**Module:** BLIH CRM (Customer Relationship Management)  
**Version:** 1.0  
**Last Updated:** February 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Module Overview](#module-overview)
2. [User Personas](#user-personas)
3. [Feature Catalog](#feature-catalog)
4. [User Experience Flows](#user-experience-flows)
5. [UI Components & Patterns](#ui-components--patterns)
6. [Sales Pipeline Management](#sales-pipeline-management)
7. [Permissions & Access Control](#permissions--access-control)
8. [Integration Points](#integration-points)

---

## Module Overview

### Purpose

The BLIH CRM Module provides comprehensive customer relationship management, from lead capture through deal closure and account management. It enables sales teams to track opportunities, manage customer interactions, and forecast revenue with confidence.

### Value Proposition

- **Increase Win Rates:** Structured sales process with stage-specific guidance and probability tracking
- **Improve Forecast Accuracy:** Real-time pipeline visibility with weighted value calculations
- **Enhance Customer Relationships:** Complete interaction history and automated follow-up reminders
- **Accelerate Sales Cycles:** Automated workflows and task assignments reduce manual overhead
- **Drive Revenue Growth:** Analytics on conversion rates, deal velocity, and rep performance

### Target Users

| Role            | Primary Use Case                      | Key Features Used                          |
| --------------- | ------------------------------------- | ------------------------------------------ |
| Sales Rep       | Daily selling activities              | Leads, deals, pipeline, activities         |
| Sales Manager   | Team coaching, forecasting            | Pipeline view, reports, activity tracking  |
| Account Manager | Post-sale relationship management     | Organization profiles, interaction history |
| Marketing       | Lead qualification, campaign tracking | Lead sources, conversion analytics         |
| Executive       | Revenue oversight                     | Dashboards, forecasts, win/loss analysis   |

---

## User Personas

### Persona 1: David - Sales Representative

**Profile:** 3 years in B2B sales, quota: $500K annually, manages 40-50 opportunities  
**Goals:**

- Meet and exceed monthly/quarterly quotas
- Build strong relationships with prospects
- Understand where each deal stands
- Never drop the ball on follow-ups

**Pain Points:**

- Forgetting to follow up with leads
- No visibility into deal health until it's too late
- Time wasted on data entry
- Can't easily see what activities drive wins

**How BLIH Helps:**

- Automated follow-up reminders and task creation
- Deal health score based on activity patterns
- Email/Calendar integration reduces manual entry
- Win/loss pattern analysis in Brain module

### Persona 2: Jennifer - Sales Manager

**Profile:** 10 years sales experience, manages team of 8 reps, reports to VP Sales  
**Goals:**

- Accurately forecast quarterly revenue
- Coach underperforming reps
- Ensure consistent sales process adoption
- Identify pipeline risks early

**Pain Points:**

- Sales forecasts are always inaccurate
- Don't know which deals are truly at risk
- Reps use different processes and terminology
- Can't easily compare rep performance

**How BLIH Helps:**

- Weighted pipeline forecasting with probability adjustments
- At-risk deal alerts based on inactivity patterns
- Stage-by-stage conversion analytics
- Rep performance scorecards with activity correlation

### Persona 3: Carlos - Account Manager

**Profile:** 5 years managing enterprise accounts, handles top 10 customers  
**Goals:**

- Maximize customer lifetime value
- Identify upsell/cross-sell opportunities
- Prevent churn through proactive engagement
- Manage complex multi-stakeholder relationships

**Pain Points:**

- Don't have visibility into all customer contacts
- Miss expansion opportunities
- Renewal dates sneak up without preparation
- Hard to track multiple ongoing conversations

**How BLIH Helps:**

- Organization contact mapping with influence tracking
- Contract renewal alerts and playbooks
- Cross-module view of customer projects and invoices
- AI-suggested upsell opportunities based on usage patterns

---

## Feature Catalog

### 1. Lead Management

#### 1.1 Lead Capture & Qualification

**Feature:** Multi-channel lead collection with automated scoring  
**User Value:** Focus on high-quality leads that convert

**Capture Channels:**

- Web forms (embedded on marketing site)
- Manual entry by sales reps
- Email parsing (forward to CRM)
- API imports (from marketing automation)
- Phone call logging
- Chatbot qualified leads

**Lead Scoring:**

- Demographic scoring (company size, industry, title)
- Behavioral scoring (website visits, content downloads, email opens)
- Source quality weighting (referral vs. cold inquiry)
- Composite score: 0-100
- Auto-assignment rules by territory/vertical

**Qualification Framework:**

- BANT (Budget, Authority, Need, Timeline) capture
- Custom qualification questions per industry
- Required fields before conversion to deal
- Disqualification reasons tracking

**UX Highlights:**

- Lead inbox with priority scoring
- Quick qualify/disqualify actions
- Auto-suggested similar past leads (via Brain)
- One-click email/call from lead card

#### 1.2 Lead Nurturing

**Feature:** Automated engagement sequences for non-sales-ready leads  
**User Value:** Stay top-of-mind without manual effort

**Capabilities:**

- Email drip campaigns with personalization
- Task reminders for manual touch points
- Lead warming score progression tracking
- Re-engagement campaigns for cold leads
- Content recommendation based on interests

**UX Highlights:**

- Visual sequence builder
- Engagement timeline showing all touchpoints
- Response tracking with open/click notifications

### 2. Deal Management

#### 2.1 Deal Pipeline

**Feature:** Visual sales pipeline with customizable stages  
**User Value:** Clear visibility into deal progression and bottlenecks

**Default Stages:**
| Stage | Probability | Exit Criteria | Typical Duration |
|-------|-------------|---------------|------------------|
| Prospecting | 10% | Contact qualified, need identified | 5-10 days |
| Qualification | 25% | Decision maker engaged, budget confirmed | 5-14 days |
| Proposal | 50% | Proposal sent, pricing discussed | 7-21 days |
| Negotiation | 75% | Contract terms active discussion | 7-14 days |
| Closed Won | 100% | Contract signed | - |
| Closed Lost | 0% | Deal lost to competitor/no decision | - |

**Stage Actions:**

- Stage-specific required fields
- Stage exit checklists
- Automated task creation per stage
- Probability override capability
- Stage history with timestamps

**UX Highlights:**

- Drag-and-drop kanban board
- Stage progression analytics
- Deal cards showing value, days in stage, health score
- Bulk stage updates for efficient pipeline management

#### 2.2 Deal Detail Management

**Feature:** Comprehensive deal record with all relevant information  
**User Value:** Complete context for every customer conversation

**Deal Components:**

- **Overview:** Value, probability, expected close, source deal
- **Contacts:** Decision makers, influencers, users with roles
- **Organization:** Parent company info, related deals
- **Products:** Line items, quantities, pricing, discounts
- **Competition:** Competitors identified, strengths/weaknesses
- **Activities:** Calls, emails, meetings, notes
- **Documents:** Proposals, contracts, NDAs
- **Team:** Internal collaborators and roles

**Deal Health Score:**

- Based on: recency of activity, stage progression, engagement level
- Color-coded: 🟢 Healthy (>80), 🟡 At Risk (50-80), 🔴 Stalled (<50)
- Trending indicators: Improving, Stable, Declining

**UX Highlights:**

- Timeline view of all deal events
- Quick action buttons (Log Call, Send Email, Schedule Meeting)
- Deal comparison side-by-side view
- AI-generated deal summary for quick catch-up

#### 2.3 Opportunity Management

**Feature:** Handle complex multi-product, multi-year opportunities  
**User Value:** Accurate forecasting for complex deals

**Capabilities:**

- Multi-year contract value tracking
- Phase-based delivery (MVP, Rollout, Expansion)
- Product bundling with discount management
- Co-terming and renewal tracking
- Partner/split revenue attribution

### 3. Contact & Organization Management

#### 3.1 Contact Management

**Feature:** Centralized contact database with relationship intelligence  
**User Value:** Know everyone involved in the buying process

**Contact Profile:**

- Basic info: Name, title, contact details
- Role in buying process: Decision Maker, Influencer, User, Champion
- Engagement history: All interactions logged
- Communication preferences: Email, phone, LinkedIn
- Personal notes: Interests, family, communication style
- Organization hierarchy: Reports to, manages

**Contact Insights:**

- Response rate analysis
- Best time to contact (based on past interactions)
- Relationship strength score
- Cross-deal involvement

**UX Highlights:**

- Contact timeline with all touchpoints
- Org chart visualization
- Merge duplicate detection
- Contact enrichment suggestions

#### 3.2 Organization Management

**Feature:** Account-based view of customer relationships **User Value:** Understand the full customer context

**Organization Profile:**

- Company details: Industry, size, location, website
- Financial health indicators (optional integration)
- Relationship map: All contacts with influence arrows
- Deal history: Won, lost, active opportunities
- Revenue summary: Lifetime value, annual spend
- Related organizations: Parent/subsidiary relationships
- Account health score based on engagement

**Account Planning:**

- Strategic account objectives
- Stakeholder mapping with political influence
- Expansion opportunity identification
- Renewal risk assessment

**UX Highlights:**

- Account 360° view combining CRM, Projects, Finance data
- Relationship web visualization
- Account scorecard with trend indicators

### 4. Activity Management

#### 4.1 Activity Logging

**Feature:** Track all customer interactions automatically  
**User Value:** Complete history without manual data entry

**Activity Types:**

- Calls (inbound/outbound, duration, outcome)
- Emails (sent/received, opens, clicks)
- Meetings (scheduled, completed, no-show)
- Tasks (to-do, deadline, priority)
- Notes (free-form, voice-to-text)
- Documents shared

**Auto-Logging:**

- Email integration captures all sent/received emails
- Calendar sync creates meeting activities
- Phone system integration (if available)
- Document access tracking

**Activity Outcomes:**

- Standardized outcome codes: Connected, Left VM, No Answer, etc.
- Next action auto-suggestion based on outcome
- Follow-up task auto-creation

**UX Highlights:**

- Activity composer with templates
- Voice-to-text note taking
- Activity streak counter for gamification
- Weekly activity summary email

#### 4.2 Task & Reminder System

**Feature:** Never miss a follow-up with intelligent reminders  
**User Value:** Reliable task management integrated with sales workflow

**Task Types:**

- Follow-up tasks (auto-created from activities)
- Stage-specific tasks (proposal due, contract review)
- Recurring tasks (weekly check-ins, monthly reviews)
- Ad-hoc tasks (personal reminders)

**Smart Reminders:**

- Intelligent timing (don't remind when customer is on vacation)
- Escalation chains (notify manager if overdue)
- Context-aware suggestions ("It's been 3 days since your last contact")

**UX Highlights:**

- Daily task list with priority ranking
- One-click complete with outcome logging
- Snooze functionality with custom intervals
- Task delegation and reassignment

### 5. Sales Analytics & Reporting

#### 5.1 Pipeline Analytics

**Feature:** Deep insights into pipeline health and trends  
**User Value:** Data-driven sales management

**Key Metrics:**

- Pipeline value (total and by stage)
- Weighted pipeline (probability-adjusted)
- Stage conversion rates
- Average deal size
- Sales cycle length
- Win/loss rates
- Pipeline coverage ratio (vs. quota)

**Visualizations:**

- Funnel chart showing stage progression
- Trend lines for pipeline value over time
- Heatmap of deals by stage and age
- Velocity chart showing days to close

**UX Highlights:**

- Date range and filter flexibility
- Compare periods (QoQ, YoY)
- Drill-down from summary to deal details
- Scheduled report delivery

#### 5.2 Sales Forecasting

**Feature:** Accurate revenue forecasting with multiple scenarios  
**User Value:** Predictable revenue planning

**Forecast Methods:**

- **Commit:** Deals expected to close (high confidence)
- **Best Case:** All deals with realistic probability
- **Pipeline:** Total pipeline value
- **Custom:** User-adjusted probabilities

**Forecast Adjustments:**

- Override deal probabilities based on knowledge
- Exclude specific deals from forecast
- Historical accuracy tracking
- Scenario modeling (what-if analysis)

**UX Highlights:**

- Forecast vs. actual tracking
- Manager review and approval workflow
- Historical forecast accuracy dashboard
- AI-powered forecast recommendations

#### 5.3 Sales Performance

**Feature:** Rep and team performance analytics  
**User Value:** Identify coaching opportunities and best practices

**Rep Scorecard:**

- Revenue attainment vs. quota
- Activity metrics (calls, emails, meetings)
- Conversion rates by stage
- Average deal size and cycle time
- Win/loss ratio
- Pipeline generation rate

**Team Comparisons:**

- Leaderboards with multiple dimensions
- Benchmarking against top performers
- Trend analysis (improving/declining)

**UX Highlights:**

- Gamification with badges and achievements
- Coaching recommendations ("Consider reviewing prospecting techniques")
- Peer comparison sparklines

### 6. Product & Pricing

#### 6.1 Product Catalog

**Feature:** Manage products/services offered  
**User Value:** Consistent pricing and proposal generation

**Product Information:**

- SKU, name, description, category
- List price and cost (for margin calculation)
- Pricing tiers (volume discounts)
- Bundle configurations
- Optional add-ons
- Term options (monthly, annual, multi-year)

#### 6.2 Quote Generation

**Feature:** Create professional proposals quickly  
**User Value:** Faster time-to-proposal, fewer errors

**Capabilities:**

- Product selector with search
- Configurator for complex products
- Automatic discount calculations
- Multi-currency support
- Tax calculation (regional rules)
- Terms & conditions templates
- E-signature integration

**UX Highlights:**

- Quote preview in real-time
- One-click PDF generation
- Email quote directly from CRM
- Quote acceptance tracking

---

## User Experience Flows

### Flow 1: Lead to Deal Conversion

**Scenario:** David qualifies a new inbound lead and converts it to an opportunity

```
1. New lead "Acme Corp" arrives from website form
   ├─ System assigns to David based on territory rules
   ├─ Notification: "New lead assigned - Acme Corp"
   └─ Lead appears in David's inbox with score: 75

2. David reviews lead card
   ├─ Company info: Manufacturing, 500 employees, $50M revenue
   ├─ Contact: John Smith, VP Operations
   ├─ Interest: "Looking for inventory management solution"
   └─ Source: Google Ads - "Inventory Software"

3. David clicks "Qualify"
   ├─ BANT questionnaire appears
   ├─ David fills: Budget $100K, Authority confirmed, Need validated
   ├─ System calculates: Lead score 92 (Hot)
   └─ Suggests: "Convert to Deal" or "Schedule Discovery Call"

4. David schedules discovery call
   ├─ Calendar widget shows mutual availability
   ├─ Selects: Tomorrow 2:00 PM (30 min)
   ├─ Email template auto-populated
   └─ Sends invitation with one click

5. Post-call (next day)
   ├─ Reminder: "Log call with Acme Corp"
   ├─ David logs: "Discovery completed, confirmed $100K budget"
   ├─ Outcome: "Qualified - Convert to Deal"
   └─ System creates deal automatically

6. Deal created
   ├─ Stage: Prospecting
   ├─ Value: $100K (based on lead qualification)
   ├─ Probability: 10%
   ├─ Expected close: 60 days (from historical data)
   └─ Tasks created: Send proposal, Schedule demo
```

### Flow 2: Pipeline Management

**Scenario:** Jennifer reviews team pipeline and coaches reps

```
[Monday Morning - Pipeline Review]

1. Jennifer opens Pipeline Dashboard
   ├─ Summary Cards:
   │  ├─ Total Pipeline: $4.2M
   │  ├─ Weighted: $2.1M (50% probability)
   │  ├─ This Quarter Commit: $1.8M (against $2M quota)
   │  └─ At-Risk Deals: 3 ($450K value)
   └─ Visual: Kanban board with all team deals

2. Jennifer spots red flags
   ├─ Hover over "TechStart Inc" deal
   │  └─ Alert: "No activity in 14 days, health score: 32"
   └─ Clicks to view detail

3. Deal Detail Analysis
   ├─ Stage: Negotiation (should be closing soon)
   ├─ Last activity: Email sent 14 days ago, no response
   ├─ History: Was progressing well, then went cold
   └─ AI Suggestion: "Send break-up email or schedule call"

4. Jennifer takes action
   ├─ Comments on deal: "@David - This deal is stalling.
   │                    Can you schedule a call this week?"
   ├─ Task automatically assigned to David
   └─ Alert set: Notify if no activity in 3 days

5. Forecast Review
   ├─ Switches to Forecast view
   ├─ David's commit: $500K (5 deals)
   ├─ David's best case: $750K (8 deals)
   └─ Jennifer adjusts: Moves 2 deals from commit to best case

6. Weekly Team Meeting
   ├─ Jennifer shares screen: Pipeline trends
   ├─ Highlights: Conversion rates improved 15% this month
   ├─ Coaching focus: "Let's review negotiation tactics"
   └─ Assigns training via HR integration
```

### Flow 3: Account Expansion

**Scenario:** Carlos identifies upsell opportunity in existing account

```
1. Carlos views "GlobalTech Inc" account
   ├─ Org chart: 5 contacts mapped
   ├─ Deal history: $200K initial deal (2024)
   ├─ Active projects: 3 from Projects module
   └─ Recent invoices: $15K/month average

2. Expansion Signals
   ├─ AI Notification: "Usage increased 40% this quarter"
   ├─ Support tickets: 3 "need more users" requests
   ├─ Finance note: "Asked about enterprise pricing"
   └─ LinkedIn: Hiring 10 more people in relevant dept

3. Carlos creates expansion opportunity
   ├─ New deal: "GlobalTech Inc - Expansion Q1"
   ├─ Value: $50K additional ARR
   ├─ Contacts: Adds new VP (identified via LinkedIn)
   └─ Links to original deal for context

4. Multi-threaded approach
   ├─ Schedules meeting with existing champion
   ├─ Requests intro to VP via mutual connection
   └─ Prepares ROI analysis showing usage trends

5. Proposal & Close
   ├─ Uses quote builder with volume pricing
   ├─ Co-terms with existing contract
   ├─ Addresses security review efficiently
   └─ Wins expansion: $50K added to annual contract

6. Post-win actions (automated)
   ├─ Finance notified for invoice adjustment
   ├─ Projects module updated with expansion scope
   ├─ Brain logs: "Expansion pattern: Usage + Hiring signal"
   └─ Next renewal reminder set for 11 months
```

---

## UI Components & Patterns

### Pipeline Board View

```
┌─────────────────────────────────────────────────────────────────────┐
│  Sales Pipeline                     [+ Add Deal]  [⚙️ Customize]  │
├─────────────────────────────────────────────────────────────────────┤
│  Filter: [All Deals ▼]  Owner: [All ▼]  Value: [$0 - $10M]         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PROSPECTING (12)    QUALIFICATION (8)   PROPOSAL (5)              │
│  $1.2M total         $800K total          $2.1M total               │
│  ┌──────────────┐   ┌──────────────┐    ┌──────────────┐           │
│  │ Acme Corp    │   │ TechStart    │    │ MegaSoft     │           │
│  │ $100K 🟢     │   │ $150K 🔴     │    │ $500K 🟡     │           │
│  │ 5 days       │   │ 45 days      │    │ 21 days      │           │
│  │ [📞] [✉️]   │   │ [📞] [✉️]   │    │ [📞] [✉️]   │           │
│  └──────────────┘   └──────────────┘    └──────────────┘           │
│  ┌──────────────┐   ┌──────────────┐    └──────────────┘           │
│  │ WidgetCo     │   │ DataSys      │                               │
│  │ $75K 🟢      │   │ $200K 🟢     │                               │
│  └──────────────┘   └──────────────┘                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Deal Card Detail

```
┌──────────────────────────────────────────────────────────┐
│  MegaSoft Inc.                           [Edit] [•••]   │
│  Enterprise License - Q1 2026                           │
├──────────────────────────────────────────────────────────┤
│  Stage: PROPOSAL (50%)          Health: 🟡 At Risk       │
│  Value: $500,000            Expected: Mar 15, 2026    │
│  Owner: David Chen          Source: Inbound Website     │
├──────────────────────────────────────────────────────────┤
│  Contacts                                               │
│  ├─ Sarah Johnson (Decision Maker) 📞 ✉️               │
│  ├─ Mike Ross (Champion) 📞 ✉️                        │
│  └─ Finance Team (Reviewer) ✉️                        │
├──────────────────────────────────────────────────────────┤
│  Recent Activity                                        │
│  ├─ Today: Proposal sent                               │
│  ├─ 2 days ago: Demo completed ✓                       │
│  ├─ 1 week ago: Discovery call                         │
│  └─ [View All 12 Activities]                            │
├──────────────────────────────────────────────────────────┤
│  [Log Activity] [Send Email] [Schedule] [Create Task]  │
└──────────────────────────────────────────────────────────┘
```

### Lead Inbox

```
┌─────────────────────────────────────────────────────────────────┐
│  Lead Inbox (5 New)        [Filter] [Sort by Score ▼]          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔥 TechVenture Inc.                     Score: 94    │   │
│  │ Manufacturing • 200 employees • VP Engineering         │   │
│  │ Source: Referral from GlobalTech                      │   │
│  │ [View] [Qualify] [Assign] [Disqualify]               │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Widget Corp                              Score: 78    │   │
│  │ Retail • 50 employees • IT Director                   │   │
│  │ Source: Trade Show Lead                                │   │
│  │ [View] [Qualify] [Assign] [Disqualify]               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Sales Pipeline Management

### Stage Definitions & Exit Criteria

Each stage has specific requirements that must be met before progression:

**Stage: Prospecting → Qualification**

- Required: Contact identified, Initial outreach completed
- Optional: Need expressed, Budget discussed
- Evidence: Logged call/email, Contact record created

**Stage: Qualification → Proposal**

- Required: BANT confirmed (all 4 elements)
- Required: Decision process understood
- Required: Technical requirements gathered
- Evidence: Discovery call notes, Qualification checklist complete

**Stage: Proposal → Negotiation**

- Required: Formal proposal delivered
- Required: Pricing discussed with decision maker
- Optional: Technical evaluation passed
- Evidence: Proposal sent activity, Email confirmation

**Stage: Negotiation → Closed Won**

- Required: Contract terms agreed
- Required: Legal review complete (if applicable)
- Required: Signed contract or PO received
- Evidence: Signed document uploaded, Deal marked won

### Probability Guidelines

| Stage         | Default | Adjust When                              |
| ------------- | ------- | ---------------------------------------- |
| Prospecting   | 10%     | Early engagement, warm intro: +5-10%     |
| Qualification | 25%     | Strong champion, clear timeline: +10-15% |
| Proposal      | 50%     | Pilot in progress, verbal yes: +15-20%   |
| Negotiation   | 75%     | Contract redlines minimal: +10%          |

---

## Permissions & Access Control

### Permission Matrix

| Feature                | Sales Rep | Sales Manager | Account Manager | Admin |
| ---------------------- | --------- | ------------- | --------------- | ----- |
| View Own Deals         | ✅        | ✅            | ✅              | ✅    |
| View Team Deals        | ❌        | ✅            | ✅              | ✅    |
| View All Deals         | ❌        | ❌            | ❌              | ✅    |
| Edit Own Deals         | ✅        | ✅            | ✅              | ✅    |
| Edit Others' Deals     | ❌        | ✅ (team)     | ❌              | ✅    |
| Delete Deals           | ❌        | ❌            | ❌              | ✅    |
| Manage Pipeline Stages | ❌        | View          | View            | ✅    |
| View All Contacts      | Own deals | Team deals    | Accounts        | ✅    |
| Export Data            | Own       | Team          | Accounts        | ✅    |
| Manage Products        | View      | View          | View            | ✅    |
| Configure CRM Settings | ❌        | ❌            | ❌              | ✅    |

### Granular Permissions

CRM permissions follow pattern: `CRM:{resource}:{action}`

| Permission              | Description                        |
| ----------------------- | ---------------------------------- |
| `CRM:lead:view`         | View leads in assigned territories |
| `CRM:lead:create`       | Create new leads                   |
| `CRM:lead:edit`         | Edit lead information              |
| `CRM:lead:convert`      | Convert leads to deals             |
| `CRM:deal:view`         | View deals                         |
| `CRM:deal:create`       | Create deals                       |
| `CRM:deal:edit`         | Edit deal details                  |
| `CRM:deal:stage`        | Change deal stages                 |
| `CRM:deal:close`        | Mark deals won/lost                |
| `CRM:contact:view`      | View contacts                      |
| `CRM:contact:create`    | Add contacts                       |
| `CRM:organization:view` | View organization accounts         |
| `CRM:activity:log`      | Log activities                     |
| `CRM:report:view`       | Access reports                     |
| `CRM:forecast:manage`   | Adjust forecasts                   |

---

## Integration Points

### Outbound Events (CRM Publishes)

| Event                    | Trigger             | Subscribers                        | Data                       |
| ------------------------ | ------------------- | ---------------------------------- | -------------------------- |
| `crm.lead.created`       | New lead added      | Brain, Marketing                   | Lead details, source       |
| `crm.lead.qualified`     | Lead meets criteria | HR (capacity check)                | Qualified lead info        |
| `crm.deal.created`       | Lead converted      | Projects (capacity)                | Deal value, timeline       |
| `crm.deal.stage.changed` | Stage progression   | Manager (alerts)                   | Old/new stage, probability |
| `crm.deal.won`           | Deal closed won     | Finance (invoice), Projects, Brain | Full deal data, customer   |
| `crm.deal.lost`          | Deal closed lost    | Brain (analysis)                   | Loss reason, competitor    |
| `crm.activity.logged`    | Activity recorded   | Notifications                      | Activity type, deal        |

### Inbound Events (CRM Consumes)

| Event                         | Source   | Action                         |
| ----------------------------- | -------- | ------------------------------ |
| `finance.invoice.paid`        | Finance  | Update customer health score   |
| `finance.invoice.overdue`     | Finance  | Alert account manager          |
| `project.milestone.completed` | Projects | Update deal delivery status    |
| `project.issue.blocker`       | Projects | Flag account risk              |
| `hr.employee.terminated`      | HR       | Reassign account if rep leaves |

### External Integrations

| System                 | Type    | Purpose                               |
| ---------------------- | ------- | ------------------------------------- |
| Email (Gmail/Outlook)  | API     | Bi-directional sync, activity logging |
| Calendar               | API     | Meeting scheduling, availability      |
| LinkedIn               | API     | Contact enrichment, social selling    |
| Marketing Automation   | Webhook | Lead scoring, campaign attribution    |
| Phone System           | CTI     | Call logging, click-to-dial           |
| E-signature (DocuSign) | API     | Contract sending and tracking         |
| Data Enrichment        | API     | Company/contact data auto-fill        |

---

## Mobile Experience

### Mobile-Specific Features

- Quick contact lookup with click-to-call
- Voice-to-text activity logging
- Geolocation-based visit check-in
- Offline deal browsing with sync
- Push notifications for urgent tasks
- Photo capture for business card OCR

---

_Documentation Version: 1.0_  
_Module Version: 1.0_  
_Last Updated: February 2026_
