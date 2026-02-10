# BLIH Finance Module - Feature & User Experience Documentation

**Module:** BLIH Finance (Financial Management)  
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
6. [Compliance & Taxation](#compliance--taxation)
7. [Permissions & Access Control](#permissions--access-control)
8. [Integration Points](#integration-points)

---

## Module Overview

### Purpose
The BLIH Finance Module provides comprehensive financial management including accounting, invoicing, payroll, expense management, and financial reporting. It ensures financial compliance, accurate record-keeping, and timely financial insights for decision-making.

### Value Proposition
- **Ensure Compliance:** Built-in support for tax regulations, audit trails, and financial controls
- **Accelerate Cash Flow:** Automated invoicing, payment tracking, and reminders
- **Reduce Admin Time:** Payroll automation, expense approval workflows, and bank reconciliation
- **Improve Visibility:** Real-time financial dashboards, P&L reports, and cash flow forecasting
- **Maintain Accuracy:** Double-entry accounting with audit trails and approval workflows

### Target Users
| Role | Primary Use Case | Key Features Used |
|------|-----------------|-------------------|
| CFO/Finance Director | Strategic financial oversight | Reports, budgets, forecasts, compliance |
| Accountant | Daily bookkeeping | Transactions, reconciliation, journal entries |
| Accounts Receivable | Customer invoicing & collections | Invoices, payments, aging reports |
| Accounts Payable | Vendor payments & expenses | Bills, expense approvals, payments |
| Payroll Specialist | Employee compensation | Payroll processing, tax filings |
| Department Manager | Budget management | Expense approvals, budget vs actual |
| Employee | Expense submission | Expense claims, reimbursement tracking |

---

## User Personas

### Persona 1: Margaret - CFO
**Profile:** 15 years finance experience, MBA, reports to CEO, manages 4-person team  
**Goals:**
- Provide accurate financial insights to leadership
- Ensure regulatory compliance and audit readiness
- Optimize cash flow and working capital
- Support strategic planning with financial data

**Pain Points:**
- Financial reports take days to compile
- Cash flow surprises from delayed customer payments
- Manual processes create errors and delays
- Difficult to track profitability by project/customer

**How BLIH Helps:**
- Real-time dashboards replace manual report compilation
- Automated payment reminders and aging alerts
- Integrated workflows reduce manual data entry
- Project-based profitability analysis via CRM/Projects integration

### Persona 2: Robert - Staff Accountant
**Profile:** CPA, 3 years experience, handles day-to-day bookkeeping  
**Goals:**
- Maintain accurate books with minimal errors
- Close month-end quickly and efficiently
- Reconcile accounts accurately
- Support audit requests promptly

**Pain Points:**
- Time-consuming manual journal entries
- Tracking down missing receipts and approvals
- Reconciling bank statements takes days
- Audit preparation is stressful and time-consuming

**How BLIH Helps:**
- Recurring journal entries automated
- Digital receipt capture with mobile app
- Bank feed integration with auto-matching
- Always-ready audit trails and documentation

### Persona 3: Emily - HR/Payroll Specialist
**Profile:** Handles payroll for 200 employees, bi-weekly cycles  
**Goals:**
- Process payroll accurately and on time
- Ensure tax compliance and filing
- Handle employee payroll inquiries
- Manage benefits deductions

**Pain Points:**
- Manual time entry collection from various sources
- Tax calculation errors are costly
- Employee questions about pay take hours to research
- Benefits changes are complex to track

**How BLIH Helps:**
- Integrated time tracking from Projects module
- Automated tax calculations with updates
- Employee self-service for pay stubs and history
- Benefits portal with automatic deduction sync

---

## Feature Catalog

### 1. Chart of Accounts

#### 1.1 Account Management
**Feature:** Hierarchical chart of accounts with flexible configuration  
**User Value:** Organized financial structure that scales with business

**Account Types:**
- **Assets:** Current (Cash, AR, Inventory), Fixed (Equipment, Property)
- **Liabilities:** Current (AP, Short-term debt), Long-term (Loans)
- **Equity:** Capital, Retained Earnings, Dividends
- **Revenue:** Operating, Non-operating
- **Expenses:** COGS, Operating, Administrative

**Account Properties:**
- Account code (numeric or alphanumeric)
- Name and description
- Parent/child relationships
- Tax mapping codes
- Budget tracking flag
- Active/inactive status

**UX Highlights:**
- Tree view with expand/collapse
- Drag-and-drop reordering
- Import from Excel/CSV
- Account usage statistics

### 2. General Ledger & Transactions

#### 2.1 Journal Entries
**Feature:** Double-entry bookkeeping with flexible entry types  
**User Value:** Accurate financial records with full audit trail

**Entry Types:**
- **Simple:** One debit, one credit
- **Compound:** Multiple debits/credits
- **Recurring:** Automated repeating entries
- **Reversing:** Auto-reverse on specified date
- **Adjusting:** Period-end adjustments
- **System:** Auto-generated from sub-ledgers

**Entry Workflow:**
1. Create draft entry
2. Attach supporting documents
3. Submit for review (configurable approval)
4. Post to ledger (immutable after posting)
5. Generate audit trail entry

**UX Highlights:**
- Smart account autocomplete
- Balance validation in real-time
- Template library for common entries
- Split-screen document viewer
- Bulk import with validation

#### 2.2 Bank Reconciliation
**Feature:** Match bank transactions to ledger entries  
**User Value:** Accurate cash position and fraud detection

**Bank Feed Integration:**
- Automatic import from supported banks
- CSV/Excel upload for unsupported banks
- Real-time balance checking

**Matching Rules:**
- Auto-match exact amounts
- Suggested matches for similar amounts
- Bulk matching for recurring transactions
- Manual match override

**Reconciliation Process:**
1. Import bank statement
2. System suggests matches
3. Review and confirm matches
4. Create entries for unmatched items
5. Mark as reconciled
6. Generate reconciliation report

**UX Highlights:**
- Side-by-side bank vs. ledger view
- One-click matching
- Unreconciled item alerts
- Reconciliation history

### 3. Accounts Receivable

#### 3.1 Customer Invoicing
**Feature:** Professional invoice creation and delivery  
**User Value:** Faster payment collection with branded documentation

**Invoice Creation:**
- **From CRM Deal:** Auto-generate from won opportunity
- **From Project Time:** Billable hours auto-converted to invoice
- **From Contract:** Recurring invoices for retainer agreements
- **Manual:** Custom invoice line items

**Invoice Components:**
- Header: Company branding, invoice number, dates
- Customer: Bill-to address, contact, purchase order
- Line items: Description, quantity, rate, amount
- Subtotals, discounts, tax calculations
- Payment terms and methods
- Notes and terms & conditions

**Invoice Delivery:**
- Email directly from system
- Customer portal access
- PDF download
- Print to mail

**UX Highlights:**
- Branded templates (customizable)
- Drag-and-drop line item reordering
- Tax auto-calculation by jurisdiction
- Preview before sending
- Duplicate invoice detection

#### 3.2 Payment Processing
**Feature:** Record and apply customer payments  **User Value:** Accurate cash application and reduced DSO

**Payment Recording:**
- Single invoice payment
- Partial payments
- Multiple invoice application
- Overpayment handling (credit memo)
- Prepayment recording

**Payment Methods:**
- Bank transfer/Wire
- Check (with image upload)
- Credit card (via integrated gateway)
- Cash
- Other

**Auto-Application:**
- Suggest oldest invoices first
- Apply to specific invoices by reference
- Handle currency conversion
- Calculate early payment discounts

**UX Highlights:**
- Unapplied payment dashboard
- Batch payment entry
- Deposit slip generation
- Payment reminder scheduling

#### 3.3 Collections Management
**Feature:** Automated dunning and collections workflow  **User Value:** Improved cash flow with reduced manual follow-up

**Aging Buckets:**
- Current
- 1-30 days past due
- 31-60 days past due
- 61-90 days past due
- 90+ days past due

**Collection Actions:**
- Automated email reminders (configurable schedule)
- Escalating message templates
- Task creation for manual follow-up
- Collections call logging
- Payment plan tracking

**UX Highlights:**
- Aging report with drill-down
- Customer payment history
- Collection effectiveness dashboard
- Promise-to-pay tracking

### 4. Accounts Payable

#### 4.1 Vendor Management
**Feature:** Supplier database with payment preferences  **User Value:** Organized vendor relationships with payment efficiency

**Vendor Profile:**
- Contact information
- Payment terms and methods
- Tax ID and forms (W-9, etc.)
- Default GL accounts
- 1099/1096 tracking
- Purchase history

**UX Highlights:**
- Vendor performance metrics
- Duplicate vendor detection
- Bulk payment method setup

#### 4.2 Bill Management
**Feature:** Track and pay vendor invoices  **User Value:** Timely payments with accurate cash flow planning

**Bill Entry:**
- Manual entry
- Email forwarding (OCR capture)
- Import from vendor portals
- Recurring bills (utilities, rent)

**Approval Workflow:**
1. Bill entered (draft)
2. Route to approver based on amount/rules
3. Approve/reject with comments
4. Schedule for payment
5. Execute payment

**Payment Scheduling:**
- Pay on due date
- Pay early for discount
- Batch payments for efficiency
- Cash flow optimized scheduling

**UX Highlights:**
- Bill aging dashboard
- Approval inbox for managers
- Payment calendar view
- Check/payment batch processing

#### 4.3 Expense Management
**Feature:** Employee expense submission and reimbursement  **User Value:** Efficient expense processing with policy compliance

**Expense Submission:**
- Mobile receipt capture (photo)
- Mileage tracking with GPS
- Per diem auto-calculation
- Corporate card import
- Bulk expense reports

**Expense Properties:**
- Date, amount, currency
- Category (GL account mapping)
- Project/customer allocation
- Receipt attachment
- Notes

**Approval Workflow:**
- Auto-approval under threshold
- Manager approval for standard expenses
- Multi-level for large amounts
- Policy violation alerts

**Reimbursement:**
- Direct deposit setup
- Reimbursement schedule (payroll or separate)
- Expense report status tracking

**UX Highlights:**
- Receipt photo with auto-extraction
- Policy guardrails (max amounts, categories)
- Expense report templates
- Mobile app for on-the-go submission

### 5. Payroll

#### 5.1 Payroll Processing
**Feature:** Calculate and process employee compensation  **User Value:** Accurate, compliant payroll with minimal effort

**Payroll Cycle:**
- **Setup:**
  - Select pay period
  - Import time data (from Projects/HR)
  - Review adjustments (bonuses, deductions)
  - Validate calculations

- **Processing:**
  - Gross pay calculation
  - Tax withholdings (federal, state, local)
  - Benefit deductions
  - Garnishments
  - Net pay calculation

- **Completion:**
  - Generate pay stubs
  - Process direct deposits
  - Generate tax filings
  - Post to GL
  - Close payroll

**Tax Compliance:**
- Multi-jurisdiction support
- Automatic tax table updates
- W-2/1099 generation
- Quarterly filings (941, state)
- Year-end processing

**UX Highlights:**
- Payroll preview before processing
- Exception report for review
- One-click processing for standard payroll
- Payroll calendar with deadlines

#### 5.2 Payroll Reporting
**Feature:** Comprehensive payroll analytics and compliance reports  **User Value:** Compliance and cost analysis

**Reports:**
- Payroll register
- Tax liability summary
- Deductions summary
- Labor distribution
- Workers compensation
- 401(k) contributions

**Analytics:**
- Payroll cost trends
- Department labor costs
- Overtime analysis
- Headcount reporting

**UX Highlights:**
- Pre-built report templates
- Custom report builder
- Scheduled report delivery
- Export to Excel/PDF

### 6. Financial Reporting

#### 6.1 Standard Reports
**Feature:** Essential financial statements and reports  **User Value:** Accurate financial visibility for stakeholders

**Core Reports:**
- **Balance Sheet:** Assets, liabilities, equity at point in time
- **Income Statement (P&L):** Revenue, expenses, profit by period
- **Cash Flow Statement:** Operating, investing, financing activities
- **Trial Balance:** All accounts with balances
- **General Ledger:** Detailed transaction listing

**Operational Reports:**
- AR Aging
- AP Aging
- Sales by customer/product
- Expense by category/department
- Budget vs. Actual

**UX Highlights:**
- Comparative periods (current vs. prior)
- Drill-down from summary to detail
- Custom date ranges
- Export to Excel/PDF
- Scheduled email delivery

#### 6.2 Management Dashboards
**Feature:** Visual financial KPIs and trends  **User Value:** Quick financial health assessment

**Dashboard Widgets:**
- Cash position
- Outstanding AR/AP
- Monthly revenue trend
- Expense breakdown
- Profitability metrics
- Budget variance

**Customization:**
- User-specific dashboard layout
- Widget selection and sizing
- Date range selectors
- Alert thresholds

**UX Highlights:**
- Real-time data refresh
- Interactive charts with drill-down
- Mobile-responsive layout
- One-click export

#### 6.3 Budgeting & Forecasting
**Feature:** Plan and track against financial targets  **User Value:** Proactive financial management

**Budget Creation:**
- Import prior year actuals
- Top-down target allocation
- Bottom-up department input
- Version control
- Multiple scenarios

**Tracking:**
- Monthly budget vs. actual
- Variance analysis
- Forecast updates
- Year-end projection

**UX Highlights:**
- Spreadsheet-like input
- Variance color coding
- Roll-up from department to company
- Forecast scenario comparison

### 7. Multi-Currency & Taxation

#### 7.1 Multi-Currency Support
**Feature:** Handle transactions in multiple currencies  **User Value:** International business operations

**Features:**
- Base currency setting
- Transaction currency recording
- Exchange rate management (manual or API)
- Realized/unrealized gain/loss calculation
- Currency revaluation
- Reporting in any currency

**UX Highlights:**
- Automatic rate lookups
- Historical rate lookup
- Currency conversion calculator

#### 7.2 Tax Management
**Feature:** Comprehensive tax calculation and reporting  **User Value:** Compliance with tax regulations

**Tax Types:**
- Sales/VAT/GST
- Withholding taxes
- Payroll taxes
- Corporate income tax

**Features:**
- Tax code library by jurisdiction
- Tax rate management
- Tax return preparation
- Filing deadline tracking

**UX Highlights:**
- Tax summary dashboard
- Filing calendar
- Tax liability estimation

---

## User Experience Flows

### Flow 1: Invoice to Payment Collection

**Scenario:** Margaret tracks invoice from creation through payment

```
[Invoice Creation - Day 0]

1. CRM triggers project completion milestone
   └─ Event: crm.deal.milestone.completed

2. Finance receives notification
   ├─ "TechCorp project ready for invoicing"
   ├─ Pre-generated invoice from project time
   └─ Review screen opens

3. Review and Send (Robert)
   ├─ Invoice details:
   │  ├─ Customer: TechCorp Inc.
   │  ├─ Amount: $45,000
   │  ├─ Line items: 300 hours @ $150/hr
   │  ├─ Tax: $3,600 (8%)
   │  └─ Total: $48,600
   ├─ Attach: Timesheet summary, expense report
   ├─ Preview branded invoice PDF
   └─ Click "Send to Customer"

4. Delivery
   ├─ Email sent to TechCorp AP contact
   ├─ Copy to Account Manager
   ├─ Invoice logged in AR aging
   └─ Payment due date: Net 30 (30 days from now)

[Payment Tracking - Days 1-30]

5. Automated reminders
   ├─ Day 7: Friendly reminder email
   ├─ Day 21: "Payment due in 9 days"
   ├─ Day 31: "Payment overdue" + phone call task
   └─ Margaret reviews AR aging weekly

6. Day 28: Payment received
   ├─ Bank notification: $48,600 deposited
   ├─ Robert applies payment to invoice #2026-0042
   ├─ Invoice marked: PAID
   ├─ Customer account updated
   ├─ GL entry: Debit Cash, Credit AR
   └─ Receipt emailed to customer

7. Cash flow impact
   ├─ Cash position dashboard updates
   ├─ DSO metric improves
   └─ Forecast updated
```

### Flow 2: Month-End Close

**Scenario:** Robert executes month-end close process

```
[Month-End Close - February 2026]

1. Day 1 (March 1): Close preparation
   ├─ System checklist appears:
   │  ├─ All bank accounts reconciled? ✓
   │  ├─ All AP/AR items entered? ✓
   │  ├─ Payroll posted? ✓
   │  ├─ Depreciation calculated? Pending
   │  └─ Accruals entered? Pending
   └─ Robert starts with unreconciled items

2. Bank reconciliation
   ├─ Import February bank statements (3 accounts)
   ├─ System auto-matches 95% of transactions
   ├─ Review 5 unmatched items
   │  ├─ 2 checks not yet cleared (normal)
   │  ├─ 1 deposit recorded wrong date (correct)
   │  └─ 2 new items (create entries)
   └─ All accounts reconciled ✓

3. Adjusting entries
   ├─ Monthly depreciation (recurring entry)
   │  └─ Auto-posted based on fixed asset register
   ├─ Prepaid expense amortization
   │  └─ Insurance, rent allocation
   ├─ Accrued expenses
   │  └─ Feb utilities not yet billed
   └─ Revenue recognition
      └─ Deferred revenue amortization

4. Review and approval
   ├─ Trial balance generated
   ├─ Margaret reviews key accounts
   ├─ Variance analysis vs. prior month
   └─ Approves close

5. Financial statements
   ├─ Balance Sheet (Feb 28, 2026)
   ├─ Income Statement (February 2026)
   ├─ Cash Flow Statement (February 2026)
   └─ Management dashboard updated

6. Distribution
   ├─ Reports emailed to leadership
   ├─ Board package prepared
   ├─ Audit work papers saved
   └─ Feb 2026 closed (locked)

[Duration: 3 days (vs. 7 days before BLIH)]
```

### Flow 3: Expense Submission to Reimbursement

**Scenario:** Employee submits expense and gets reimbursed

```
[Business Trip - Expense Submission]

1. Trip: James travels to client site

2. Real-time capture (Day 1-3)
   ├─ Flight: Mobile photo of boarding pass
   │  └─ Auto-extracts: Date, amount, vendor
   ├─ Hotel: Email receipt forwarded
   ├─ Meals: Snap photos of receipts
   └─ Mileage: GPS tracking for car trip

3. Expense report creation (Day 4)
   ├─ James opens mobile app
   ├─ "Create Expense Report - Client Visit"
   ├─ All captured items appear
   ├─ Categorizes each:
   │  ├─ Flight: Travel
   │  ├─ Hotel: Lodging
   │  ├─ Meals: Meals (with client flag)
   │  └─ Mileage: Auto-calculated
   ├─ Allocates to project: "TechCorp"
   └─ Submits report

4. Approval workflow
   ├─ Day 4: Submitted
   ├─ Day 5: Manager (Priya) receives notification
   │  ├─ Reviews: All receipts attached ✓
   │  ├─ Policy check: Within limits ✓
   │  └─ Approves with one click
   └─ Day 5: Finance team receives
      ├─ Robert reviews
      └─ Schedules for next reimbursement batch

5. Reimbursement (Day 10)
   ├─ Expense included in payroll run
   ├─ James receives: $847.50 in direct deposit
   ├─ Pay stub shows expense reimbursement
   └─ GL posted: Debit Travel Expense, Credit Cash

[Total time: 10 days from expense to cash]
```

---

## UI Components & Patterns

### Financial Dashboard
```
┌─────────────────────────────────────────────────────────────────────┐
│  Financial Overview                           [Feb 2026 ▼] [⚙️]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  CASH POSITION                  REVENUE vs EXPENSE                  │
│  $245,890                       ┌────────────────────────────┐       │
│  ↑ 12% from Jan                 │ ████████████░░░░░░░░░░░░░ │       │
│                                 │ Revenue    Expense         │       │
│  OUTSTANDING AR                 └────────────────────────────┘       │
│  $124,500 (35 days)             $145K      $98K                   │
│  5 invoices overdue                                                  │
│                                                                     │
│  KEY METRICS                                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │
│  │ Gross Margin │ │   Burn Rate  │ │    Runway    │              │
│  │    42%       │ │  $32K/month  │ │   7.6 mo     │              │
│  └──────────────┘ └──────────────┘ └──────────────┘              │
│                                                                     │
│  ALERTS                                                             │
│  ⚠️  3 invoices > 60 days past due                                │
│  ⚠️  Payroll tax filing due in 5 days                            │
│  ✓  Bank reconciliation current                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Invoice List
```
┌─────────────────────────────────────────────────────────────────────┐
│  Invoices                                    [+ Create] [Filter ▼]│
├─────────────────────────────────────────────────────────────────────┤
│  Status: [All ▼]  Date: [This Month ▼]  Customer: [Search...]      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  #        Customer            Amount      Date      Due       Status│
│  ────────────────────────────────────────────────────────────────── │
│  2026-0045 TechCorp Inc.     $48,600    Feb 15   Mar 17    🟢 Paid │
│  2026-0044 Acme Corp         $12,500    Feb 10   Mar 12    🟡 Sent │
│  2026-0043 WidgetCo           $8,750    Feb 08   Mar 10    🔴 Over │
│  2026-0042 DataSys           $25,000    Jan 28   Feb 28    🟢 Paid │
│                                                                     │
│  [Export]  [Bulk Actions ▼]  Showing 1-4 of 156                    │
└─────────────────────────────────────────────────────────────────────┘
```

### Journal Entry Form
```
┌─────────────────────────────────────────────────────────────────────┐
│  Journal Entry                                       [Save Draft] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Date: [Feb 28, 2026 ▼]  Ref: [ADJ-2026-02-001]  [Attach Docs]     │
│                                                                     │
│  Description: [Monthly depreciation expense                    ]│
│                                                                     │
│  LINES                                                    DEBIT   CREDIT│
│  ─────────────────────────────────────────────────────────────────── │
│  1. [Depreciation Expense     ] [6100       ]           1,250.00      │
│  2. [Accumulated Depreciation ] [1500       ]                   1,250.00│
│                                                                     │
│  TOTALS:                                                1,250.00 1,250.00│
│  BALANCE:                                                   0.00 ✓    │
│                                                                     │
│  [+ Add Line]                                    [Post] [Cancel] │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Compliance & Taxation

### Ethiopian Tax Compliance (Example Regional Support)

BLIH includes built-in support for Ethiopian tax requirements:

**Withholding Tax:**
- VAT withholding (2% on local goods, 0% on export)
- Income tax withholding on payments to contractors
- Monthly withholding declarations

**VAT/GST:**
- Standard rate: 15%
- Zero-rated supplies tracking
- Exempt supplies tracking
- Monthly VAT returns

**Payroll Taxes:**
- Income tax brackets (progressive)
- Pension contributions (employee/employer)
- Social security calculations

**Reporting:**
- Monthly withholding tax declarations
- Quarterly/annual income tax returns
- Annual financial statements
- Audit trail maintenance

### Audit Trail

Every financial transaction includes:
- Creation timestamp and user
- Modification history (immutable after posting)
- Approval workflow record
- Supporting document links
- Related transaction references

**Audit Features:**
- Transaction log export
- User activity report
- Period locking (prevent changes)
- Read-only archive access

---

## Permissions & Access Control

### Permission Matrix

| Feature | Staff Accountant | AR/AP Clerk | Payroll Specialist | Finance Manager | CFO |
|---------|------------------|-------------|-------------------|-----------------|-----|
| View Reports | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Transactions | ✅ | ✅ | ❌ | ✅ | ✅ |
| Post Journal Entries | With approval | ❌ | ❌ | ✅ | ✅ |
| Process Payroll | ❌ | ❌ | ✅ | ✅ | ✅ |
| Approve Expenses | ❌ | ✅ | ❌ | ✅ | ✅ |
| Manage Vendors | ❌ | ✅ | ❌ | ✅ | ✅ |
| Configure Settings | ❌ | ❌ | ❌ | ✅ | ✅ |
| Close Period | ❌ | ❌ | ❌ | With approval | ✅ |

### Granular Permissions

Finance permissions follow pattern: `FINANCE:{resource}:{action}`

| Permission | Description |
|------------|-------------|
| `FINANCE:account:view` | View chart of accounts |
| `FINANCE:account:manage` | Create/edit accounts |
| `FINANCE:transaction:view` | View transactions |
| `FINANCE:transaction:create` | Create journal entries |
| `FINANCE:transaction:post` | Post to GL |
| `FINANCE:invoice:view` | View invoices |
| `FINANCE:invoice:create` | Create invoices |
| `FINANCE:invoice:send` | Send to customers |
| `FINANCE:payment:record` | Record payments |
| `FINANCE:expense:view` | View expenses |
| `FINANCE:expense:approve` | Approve expense reports |
| `FINANCE:payroll:view` | View payroll data |
| `FINANCE:payroll:process` | Run payroll |
| `FINANCE:report:view` | Access reports |
| `FINANCE:report:export` | Export financial data |
| `FINANCE:budget:view` | View budgets |
| `FINANCE:budget:manage` | Edit budgets |
| `FINANCE:period:close` | Close accounting periods |

---

## Integration Points

### Outbound Events (Finance Publishes)
| Event | Trigger | Subscribers |
|-------|---------|-------------|
| `finance.invoice.sent` | Invoice emailed | CRM (account status) |
| `finance.invoice.paid` | Payment recorded | CRM, Projects |
| `finance.invoice.overdue` | Past due | CRM (account manager alert) |
| `finance.payment.received` | Cash received | Executive (cash position) |
| `finance.payroll.processed` | Payroll complete | HR (payslip notification) |
| `finance.period.closed` | Month-end | Brain (compliance log) |
| `finance.expense.approved` | Expense OK | Employee (reimbursement queued) |
| `finance.budget.variance` | Threshold crossed | Manager (alert) |

### Inbound Events (Finance Consumes)
| Event | Source | Action |
|-------|--------|--------|
| `crm.deal.won` | CRM | Create customer account, setup billing |
| `projects.time.approved` | Projects | Billable hours for invoicing |
| `projects.expense.logged` | Projects | Project cost allocation |
| `hr.employee.hired` | HR | Add to payroll system |
| `hr.employee.terminated` | HR | Final payroll, severance calc |
| `hr.leave.approved` | HR | Adjust payroll accruals |
| `hr.timesheet.submitted` | HR/Projects | Payroll input validation |

### External Integrations
| System | Type | Purpose |
|--------|------|---------|
| Banks | API/OFX | Statement import, wire initiation |
| Payment Gateways | API | Credit card processing |
| Tax Software | API | Tax return filing |
| Payroll Services | API | Direct deposit, tax filing |
| ERP Systems | API | Enterprise integration |
| Accounting Software | Import/Export | QuickBooks, Xero migration |

---

*Documentation Version: 1.0*  
*Module Version: 1.0*  
*Last Updated: February 2026*
