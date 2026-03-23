# BLIH Projects Module - User Flow & UX Documentation

**Module:** Project Management
**Version:** 1.0
**Last Updated:** February 2026
**Audience:** Designers, Developers, Product Managers

---

## 1. User Personas

| Persona    | Role             | Primary Goals                               | Tech Comfort |
| ---------- | ---------------- | ------------------------------------------- | ------------ |
| **Priya**  | Project Manager  | Deliver on time/budget, manage risks        | High         |
| **James**  | Senior Developer | Clear priorities, minimal context switching | High         |
| **Thomas** | Resource Manager | Optimize utilization, prevent burnout       | High         |
| **Exec**   | Stakeholder      | High-level portfolio visibility             | Low-Medium   |

---

## 2. Core User Flows

### Flow 1: New Project from CRM Deal (Project Manager)

**Scenario:** A deal is won, and Priya sets up the delivery project.

```
Deal Won Notification → Create Project (Template: "Implementation")
→ Review Auto-WBS → Assign Roles (James, Sarah) → Activate Project
```

**Key Screens:**

1.  **Project Creation Wizard:** Pre-filled from Deal data (Budget $150k, Client TechCorp).
2.  **Template Selector:** "Standard Software Implementation" selected.
3.  **WBS Editor:** Tree view of Phases/Tasks. Priya adjusts dates.
4.  **Resource Allocator:** Auto-suggests James (Lead Dev) based on skills.
5.  **Project Overview:** Dashboard goes live. Status: 🟢 On Track.

**UX Principles:**

- **Automation:** Reduce manual setup by inheriting CRM data.
- **Intelligence:** Suggest resources based on availability/skill match.

### Flow 2: Daily Task Execution (Team Member)

**Scenario:** James starts his day and logs work.

```
Dashboard (My Tasks) → Select Priority Task → Start Timer
→ Work → Stop Timer → Mark "In Review"
```

**Key Screens:**

1.  **My Tasks:** Sorted list by priority/due date. "Fix Auth Bug" at top.
2.  **Task Detail:** Description, Attachments, Comments.
3.  **Timer Widget:** Floating or embedded. Shows "02:30" elapsed.
4.  **Completion Modal:** Quick comment "Fixed in PR #123". Move to "Review" column.

**UX Principles:**

- **Focus:** "My Tasks" view filters out noise.
- **Ease:** Timer is one click; manual entry is also supported.

### Flow 3: Resource Conflict Resolution (Resource Manager)

**Scenario:** Thomas spots an overallocation and resolves it.

```
Capacity Dashboard → Alert "James 150%" → Click to Resolve
→ View Alternatives → Reassign to Sarah → Confirm
```

**Key Screens:**

1.  **Heatmap:** Red cell for James (Week 3).
2.  **Conflict Detail:** Shows overlapping tasks from Project A & B.
3.  **Smart Suggestions:** "Reassign Project A task to Sarah (85% match, Available)."
4.  **Confirmation:** Notification sent to James (removed) and Sarah (added).

**UX Principles:**

- **Visuals:** Heatmaps make problems obvious instantly.
- **Actionable AI:** Don't just show problems; suggest solutions.

### Flow 4: Status Reporting (Project Manager)

**Scenario:** Weekly status update to stakeholders.

```
Project Dashboard → Click "Generate Report" → Review Metrics (Values pre-filled)
→ Add Executive Summary → Send
```

**Key Screens:**

1.  **Report Builder:** Template "Weekly Status".
2.  **Auto-Filled Data:** Progress %, Budget Burn, Top Risks, Completed Milestones.
3.  **Editor:** Text area for "PM Commentary" and "Next Week's Focus".
4.  **Preview:** Branded PDF/Email view.

**UX Principles:**

- **Time-Saving:** Automate data gathering; humans add context.

---

## 3. Navigation Structure

```
🏗️ Projects
───
📌 My Work
├─ My Tasks
├─ Timesheet
└─ Activity Feed
───
📋 Planning
├─ All Projects (List/Grid)
├─ Templates
└─ Archive
───
👥 Resources
├─ Team Capacity
├─ Skills Matrix
└─ Workload
───
⚙️ Settings
├─ Methodologies
└─ Notification Rules
```

---

## 4. Key UI Components

### Gantt Chart View

```
┌─────────────────────────────────────────────────────────────────────────┐
│  TechCorp Implementation            [Zoom: Week] [Export] [Baselines]   │
├─────────────────────────────────────────────────────────────────────────┤
│  Task Name       | Owner | Jan 1  | Jan 8  | Jan 15 | Jan 22 | Jan 29 │
├─────────────────────────────────────────────────────────────────────────┤
│  1. Discovery    | Priya | [======]        |        |        |        │
│    1.1 Kickoff   | All   | ◆               |        |        |        │
│    1.2 Rqmts     | James |  [==========]   |        |        |        │
│  2. Design       | Sarah |                 |[======]|        |        │
│    2.1 UI Mockups| Sarah |                 |  [====]|        |        │
│  3. Dev          | James |                 |        | [=============] │
└─────────────────────────────────────────────────────────────────────────┘
```

### Kanban Board

```
┌──────────────────────────────────────────────────────────────────┐
│  Sprint 4 Board                    [Filter: James] [Group: Epic] │
├──────────────────────────────────────────────────────────────────┤
│  TODO (5)             IN PROGRESS (2)      REVIEW (1)            │
│  ┌──────────────┐    ┌──────────────┐     ┌──────────────┐       │
│  │ API Endpoints│    │ Login Page   │     │ DB Schema    │       │
│  │ High 🔥      │    │ Medium       │     │ High         │       │
│  │ James        │    │ Sarah        │     │ James        │       │
│  └──────────────┘    └──────────────┘     └──────────────┘       │
└──────────────────────────────────────────────────────────────────┘
```

### Resource Heatmap

```
┌──────────────────────────────────────────────────────┐
│  Team Utilization (Next 4 Weeks)                     │
├──────────────────────────────────────────────────────┤
│  Resource  | Week 1   | Week 2   | Week 3   | Week 4 │
├──────────────────────────────────────────────────────┤
│  James     | 100% 🟢  | 100% 🟢  | 150% 🔴  | 80% 🟢 │
│  Sarah     | 50% 🟡   | 60% 🟢   | 40% 🟡   | 100% 🟢│
│  External  | 0% ⚪    | 0% ⚪    | 20% 🟢   | 0% ⚪  │
└──────────────────────────────────────────────────────┘
```

---

## 5. Mobile Experience

### Key Mobile Flows

- **Task Triage:** Swipe to complete/delegate tasks.
- **Quick Time Entry:** "Start Timer" from home screen widget.
- **Approval:** Approve Milestones/Time entries with one tap.

### Optimizations

- **Kanban Stack:** Columns become a swipable carousel.
- **Gantt List:** Timeline converts to a chronological list view.

---

## 6. Integrations

- **Slack/Teams:** Task notifications and "create task from message".
- **GitHub/GitLab:** Auto-close tasks on PR merge.
- **Google Drive:** Attach specs directly to tasks.
- **Outlook/Cal:** Sync due dates to calendar.
