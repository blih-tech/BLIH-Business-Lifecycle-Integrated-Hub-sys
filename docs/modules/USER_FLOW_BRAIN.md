# BLIH Brain Module - User Flow & UX Documentation

**Module:** Brain (AI & Knowledge Management)
**Version:** 1.0
**Last Updated:** February 2026
**Audience:** Designers, Developers, Product Managers

---

## 1. User Personas

| Persona | Role | Primary Goals | Tech Comfort |
|---------|------|---------------|--------------|
| **Jordan** | New Hire | Find policies, ask "dumb" questions | Low |
| **Alex** | Knowledge Mgr | Organize docs, track usage metrics | High |
| **Taylor** | Manager | Document decisions, find precedents | Medium |

---

## 2. Core User Flows

### Flow 1: New Employee Onboarding (Self-Service)

**Scenario:** Jordan starts Day 1 and needs to find the handbook.

```
Dashboard "Welcome" → Click "Ask Brain" 
→ Type "Where is the handbook?" → View Source → Download
```

**Key Screens:**
1.  **Global Chat Widget:** Floating button on bottom-right.
2.  **AI Response:** "Here is the Employee Handbook v3.2 [PDF]."
3.  **Source Preview:** Sidebar opens PDF to relevant page (p.12).
4.  **Follow-Up:** "Do you want to know about holidays? [Yes/No]"

**UX Principles:**
-   **Conversation:** Mimic a helpful colleague, not a search engine.
-   **Instant Gratification:** Direct link to files, not just text answers.

### Flow 2: Documenting a Key Decision (Manager)

**Scenario:** Taylor's team chooses a new vendor and wants to record why.

```
Brain Module → Decisions Tab → "Log New Decision" 
→ Fill Template (Context, Options, Choice) → Save & Share
```

**Key Screens:**
1.  **Decision Template:** "What problem are we trying to solve?"
2.  **Options Matrix:** (Option A vs Option B).
3.  **Rationale Field:** "We chose X because Y..."
4.  **Share Modal:** Notify "Project Team" via email/Slack.

**UX Principles:**
-   **Structure:** Force thinking through "Options Considered" prevents bias.
-   **Institutional Memory:** Make it searchable for future teams.

### Flow 3: Policy Update & Acknowledgment (Knowledge Manager)

**Scenario:** Alex updates the "Remote Work Policy".

```
Upload New Version → AI Auto-Tags → Publish 
→ "Request Acknowledgment" → Employees Notified
```

**Key Screens:**
1.  **Upload Dialog:** Drag & Drop PDF.
2.  **AI Tagging:** "Tags: HR, Remote, Security (Confidence: 98%)".
3.  **Distribution:** Select "All Staff".
4.  **Compliance Dashboard:** Tracker showing "150/200 Acknowledged".

**UX Principles:**
-   **Low Friction:** AI does the tagging work.
-   **Accountability:** Clear dashboard for who has/hasn't read it.

---

## 3. Navigation Structure

```
🧠 Brain
───
📚 Knowledge Base
├─ Policies
├─ Procedures (SOPs)
└─ Templates
───
🤖 AI Assistant
├─ Chat History
├─ Saved Answers
└─ Prompts Library
───
🏛️ Memory
├─ Decision Logs
├─ Lessons Learned
└─ Meeting Minutes
───
⚙️ Settings
├─ RAG Integrations
└─ Taxonomy
```

---

## 4. Key UI Components

### AI Chat Widget (Expanded)

```
┌─────────────────────────────────────────────────────────────────────┐
│  BLIH Assistant                                          [Minimize] │
├─────────────────────────────────────────────────────────────────────┤
│  🤖 AI: I found 3 documents about "Remote Work":                    │
│                                                                     │
│  1. 📄 Remote Work Policy v3.0 (Effective Mar 1)                   │
│     "Employees may work from home 2 days/week..."                   │
│                                                                     │
│  2. 📄 IT Security Guidelines                                      │
│     "VPN is required for all off-site access..."                    │
│                                                                     │
│  3. 📝 Expense Policy                                              │
│     "Home office equipment stipend: $500..."                        │
│                                                                     │
│  [Ask Follow-Up]  [Copy Answer]                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Type a message...                                        [Send]    │
└─────────────────────────────────────────────────────────────────────┘
```

### Knowledge Explorer

```
┌─────────────────────────────────────────────────────────────────────┐
│  Knowledge Base > HR > Policies                 [Upload] [Filter]   │
├─────────────────────────────────────────────────────────────────────┤
│  Name                  Updated    Tags                  Status      │
│  ────────────────────────────────────────────────────────────────── │
│  Employee Handbook     2 days ago #onboarding #hr       ✅ Published │
│  Remote Work Policy    Today      #remote #compliance   ⚠️ Draft     │
│  Holiday Schedule      Oct 2025   #calendar             ✅ Published │
│                                                                     │
│  [Preview] [Download] [Share]                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Decision Record

```
┌─────────────────────────────────────────────────────────────────────┐
│  Decision: Vendor Selection - Cloud Provider          [Edit] [Share]│
├─────────────────────────────────────────────────────────────────────┤
│  Owner: Taylor Johnson   Date: Jan 15, 2026                        │
│                                                                     │
│  THE CHOICE: AWS (Amazon Web Services)                              │
│                                                                     │
│  CONTEXT:                                                          │
│  We need to migrate legacy on-prem servers to cloud...              │
│                                                                     │
│  OPTIONS REJECTED:                                                 │
│  • Azure: Better AD integration, but higher cost for our stack.    │
│  • Google Cloud: Good data tools, but less enterprise support.     │
│                                                                     │
│  RATIONALE:                                                        │
│  AWS offers the broadest service catalog and our team is already... │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Mobile Experience

### Key Mobile Flows
-   **In-Field Answers:** Sales rep asks "What's our pricing for Enterprise?" on phone.
-   **Audio Query:** Tap microphone to ask a question while driving.
-   **Notifications:** "Please read updated Safety Policy".

---

## 6. Integrations

-   **Slack/Teams:** @Brain "What is the policy on gifts?" (Chatbot in channels).
-   **Google Drive/SharePoint:** Auto-sync documents to Knowledge Base.
-   **Jira:** Auto-log decisions from tickets into Brain Memory.

