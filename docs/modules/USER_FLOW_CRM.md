# BLIH CRM Module - User Flow & UX Documentation

**Module:** Customer Relationship Management
**Version:** 1.0
**Last Updated:** February 2026
**Audience:** Designers, Developers, Product Managers

---

## 1. User Personas

| Persona | Role | Primary Goals | Tech Comfort |
|---------|------|---------------|--------------|
| **David** | Sales Rep | Meet quota, track deals, follow up efficiently | Medium |
| **Jennifer** | Sales Manager | Forecast revenue, coach team, monitor pipeline | High |
| **Carlos** | Account Manager | Retain customers, identify upsells, manage renewals | High |
| **Sarah** | Marketing Lead | Generate high-quality leads, track campaign ROI | Medium-High |

---

## 2. Core User Flows

### Flow 1: Lead to Deal Conversion (Sales Rep)

**Scenario:** David qualifies a new inbound lead and converts it to an opportunity.

```
New Lead Notification → Review Lead Details → Qualify (BANT) 
→ Schedule Discovery Call → Log Outcome → Convert to Deal
```

**Key Screens:**
1.  **Lead Inbox:** List of new leads sorted by score. Highlighting "Acme Corp" (Score: 94).
2.  **Lead Detail View:** Company info, contact details, activity timeline, and "Qualify" button.
3.  **Qualification Modal:** BANT form (Budget, Authority, Need, Timeline). Auto-calculates score.
4.  **Scheduler:** Integrated calendar to book discovery call. Auto-email template.
5.  **Conversion Dialog:** "Convert to Deal" action. Confirms Deal Name, Value, and Stage.

**UX Principles:**
-   **Speed:** One-click actions for common tasks (email, call).
-   **Guidance:** Visual indicators for missing qualification data.
-   **Feedback:** Celebrate conversion with a success animation.

### Flow 2: Pipeline Management (Sales Manager)

**Scenario:** Jennifer reviews team pipeline and identifies at-risk deals.

```
Dashboard Overview → Filter by "At Risk" → Drill into Deal 
→ Review History → Add Comment/Task for Rep → Adjust Forecast
```

**Key Screens:**
1.  **Pipeline Dashboard:** Kanban board. Summary cards (Total Pipeline, Weighted, Commit).
2.  **Filtered View:** Highlights deals with no activity > 14 days (Red indicators).
3.  **Deal Detail:** "MegaSoft Inc" deal. Shows history of stalled communication.
4.  **Collaboration Panel:** Jennifer tags @David in a comment: "Schedule catch-up?"
5.  **Forecast View:** Drag-and-drop deals between Commit/Best Case/Pipeline buckets.

**UX Principles:**
-   **Visibility:** color-coded "Health Score" on deal cards.
-   **Actionable:** Quick actions directly from the dashboard view.
-   **Clarity:** Clear distinction between AI-calculated and user-override forecast numbers.

### Flow 3: Account Expansion (Account Manager)

**Scenario:** Carlos identifies an upsell opportunity in an existing account.

```
View Account 360 → Spot Usage Spike (AI Alert) → Create Expansion Deal 
→ Map Stakeholders → Send Proposal → Close & Co-term
```

**Key Screens:**
1.  **Account 360:** "GlobalTech Inc". Shows Usage Trends, Support Tickets, Billing History.
2.  **Opportunity Creator:** "New Deal" drawer. Pre-fills account data. Select "Type: Expansion".
3.  **Org Chart:** Visual map of contacts. Drag-and-drop to define "Champion" and "Blocker".
4.  **Quote Builder:** Add "Enterprise License Upgrade". Applies co-terming logic (pro-rated).
5.  **Proposal Preview:** Generated PDF with e-signature link.

**UX Principles:**
-   **Integration:** seamless flow from Support/Usage data to Sales actions.
-   **Intelligence:** AI prompts ("Usage up 40% - Suggest Upgrade") appear contextually.
-   **Efficiency:** Quote builder handles complex math (proration, discounts) automatically.

### Flow 4: Activity Logging & Follow-up (Sales Rep)

**Scenario:** David completes a call and logs it, setting a follow-up task.

```
Click "Log Call" → Enter Notes (Voice/Text) → Select Outcome 
→ Auto-suggest Next Step → Save
```

**Key Screens:**
1.  **Activity Composer:** Floating modal. Rich text editor for notes.
2.  **Outcome Selector:** Dropdown (Connected, Left VM, No Answer).
3.  **Next Step:** "Schedule Follow-up" checkbox auto-checked based on outcome.
4.  **Task Creator:** "Follow up regarding proposal" set for 3 days later.

**UX Principles:**
-   **Minimal Friction:** Auto-save, voice-to-text, smart defaults.
-   **Continuity:** "Log and Next" flow keeps the rep moving.

---

## 3. Navigation Structure

```
📊 CRM Dashboard (Home)
───
👥 Leads
├─ Inbox (New)
├─ My Leads
└─ All Leads
───
🤝 Pipeline
├─ My Deals (Kanban)
├─ Team Pipeline (Manager)
└─ Forecast
───
🏢 Accounts
├─ My Accounts
├─ All Accounts
└─ Org Charts
───
📇 Contacts
───
✅ Activities
├─ My Tasks
├─ Calendar
└─ History
───
📈 Reports
├─ Performance
├─ Conversion Analysis
└─ Activity Logs
```

---

## 4. Key UI Components

### Pipeline Board (Kanban)

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
│  └─ Mike Ross (Champion) 📞 ✉️                        │
├──────────────────────────────────────────────────────────┤
│  Recent Activity                                        │
│  ├─ Today: Proposal sent                               │
│  └─ [View All]                                          │
└──────────────────────────────────────────────────────────┘
```

### Lead Inbox Card

```
┌─────────────────────────────────────────────────────────┐
│ 🔥 TechVenture Inc.                     Score: 94    │
│ Manufacturing • 200 employees • VP Engineering         │
│ Source: Referral from GlobalTech                      │
│ [View] [Qualify] [Assign] [Disqualify]               │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Mobile Experience

### Key Mobile Flows
-   **Check-in:** Geo-located check-in when visiting a client.
-   **Quick Log:** "I just met John" -> Voice note recording -> AI parses to CRM note.
-   **Push Alerts:** "MegaSoft viewed your proposal" -> Tap to call.

### Optimizations
-   **Thumb-friendly:** Primary actions (Call, Email) in bottom floating bar.
-   **Offline Mode:** Read-only access to synced deals; queue updates for online sync.
-   **Card View:** Tables replaced by swipeable cards.

---

## 6. Integrations

-   **Email:** Gmail/Outlook sidebar for context within inbox.
-   **Calendar:** 2-way sync for meetings.
-   **Phone:** Click-to-dial and auto-logging.
-   **Marketing:** View campaign history on Lead/Contact profile.

