# BLIH Finance Module - User Flow & UX Documentation

**Module:** Finance & Accounting
**Version:** 1.0
**Last Updated:** February 2026
**Audience:** Designers, Developers, Product Managers

---

## 1. User Personas

| Persona      | Role       | Primary Goals                              | Tech Comfort |
| ------------ | ---------- | ------------------------------------------ | ------------ |
| **Margaret** | CFO        | Accuracy, compliance, cash flow visibility | Medium       |
| **Robert**   | Accountant | Speed, shortcuts, error prevention         | High         |
| **Sales**    | Rep        | Simple expense submission                  | Low          |

---

## 2. Core User Flows

### Flow 1: Invoice Generation & Sending (Accountant)

**Scenario:** Robert finalizes a draft invoice generated from a project milestone.

```
Notification "Project Complete" → Review Draft Invoice
→ Adjust Details (Tax, Notes) → Send to Customer
```

**Key Screens:**

1.  **Invoice Draft:** Pre-filled from Project data (Client, Amount).
2.  **Line Item Editor:** Add "Travel Expenses" line item.
3.  **Preview Mode:** See branded PDF as client will receive it.
4.  **Send Modal:** "To: billing@client.com", "Subject: Invoice #123".

**UX Principles:**

- **Confidence:** "Preview" is critical before sending financial docs.
- **Accuracy:** Auto-calculate Tax/Totals instantly on edit.

### Flow 2: Recording a Payment (Accountant)

**Scenario:** Check received in mail for $5,000.

```
Global "Receive Payment" → Select Customer → Enter Amount
→ Select Open Invoices → Apply Payment → Save
```

**Key Screens:**

1.  **Payment Entry:** "Acme Corp".
2.  **Invoices Table:** Shows 3 open invoices.
3.  **Auto-Apply:** Checks off oldest invoice first.
4.  **Confirmation:** "Payment #998 recorded. $0 balance remaining."

**UX Principles:**

- **Speed:** Keyboard navigation for heavy data entry users.
- **Smart Defaults:** Auto-select oldest invoices.

### Flow 3: Expense Submission (Employee)

**Scenario:** Sales rep submits lunch receipt.

```
Mobile App → Snap Photo → Verify Details (Amount, Date)
→ Select Category "Meals" → Submit
```

**Key Screens:**

1.  **Camera View:** Auto-edge detection for receipt.
2.  **OCR Result:** "Starbucks, $12.50, today".
3.  **Category Picker:** "Meals & Entertainment".
4.  **Project Link:** "TechCorp Kickoff".

**UX Principles:**

- **Mobile-First:** 90% of expenses happen on phones.
- **Low Effort:** OCR does the typing.

### Flow 4: Bank Reconciliation (Accountant)

**Scenario:** Month-end close.

```
Reconcile Tab → Select Account "Chase Checking"
→ Review Auto-Matches → Manually Match Remaining → Finalize
```

**Key Screens:**

1.  **Split View:** Bank Statement (Left) vs Ledger (Right).
2.  **Green Lines:** Auto-matches (90%).
3.  **Action Required:** "Unmatched Check #505". Logic: Create new expense?
4.  **Success State:** "Difference: $0.00".

**UX Principles:**

- **Visual Clarity:** Clear distinction between Bank and Book sides.
- **Exception Management:** Focus user attention only on unmatched items.

---

## 3. Navigation Structure

```
💰 Finance
───
📊 Dashboard (Cash Flow)
───
📑 Invoices (AR)
├─ Create New
├─ Unpaid
└─ Recurring
───
🧾 Bills (AP)
├─ To Pay
├─ Vendors
└─ Expenses
───
📒 Accounting
├─ Chart of Accounts
├─ Journal Entries
├─ Reconciliation
└─ Fixed Assets
───
📉 Reports
├─ P&L
├─ Balance Sheet
└─ Tax Summary
```

---

## 4. Key UI Components

### Invoice Editor

```
┌─────────────────────────────────────────────────────────────────────┐
│  Invoice #INV-2026-001                    [Save] [Preview] [Send]   │
├─────────────────────────────────────────────────────────────────────┤
│  Customer: [TechCorp Inc ▼]    Date: [Feb 10, 2026]  Due: [Net 30] │
│                                                                     │
│  Line Items                                                         │
│  Item             | Qty | Rate    | Amount    | Tax                 │
│  ────────────────────────────────────────────────────────────────── │
│  Software License | 1   | 5000.00 | 5,000.00  | 500.00 (10%)        │
│  Consulting Hours | 10  | 150.00  | 1,500.00  | 0.00 (0%)           │
│                                                                     │
│  [+ Add Line]                     Subtotal:   6,500.00              │
│                                   Tax:          500.00              │
│  Notes:                           Total:      7,000.00              │
│  [Thank you for...]                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Reconciliation Tool

```
┌─────────────────────────────────────────────────────────────────────┐
│  Chase Checking (...8892)                Statement Ending: Jan 31   │
├─────────────────────────────────────────────────────────────────────┤
│  Bank Statement (Imported)      |  General Ledger (Book)            │
│  ────────────────────────────────────────────────────────────────── │
│  Jan 15  Deposit   $5,000  🟢───🟢 Jan 15  Payment #101  $5,000     │
│  Jan 16  Check 501 -$200   🟢───🟢 Jan 12  Bill Pmt      -$200      │
│  Jan 18  Fee       -$15    🔴      [Find Match] [Create Entry]      │
│                                                                     │
│  Statement Balance: $12,500     |  Cleared Balance: $12,515         │
│  Difference:        -$15.00     |                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Financial Report (P&L)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Profit & Loss (YTD)                         [Export PDF] [Expand]  │
├─────────────────────────────────────────────────────────────────────┤
│  REVENUE                                                            │
│    Sales Income                  $150,000                           │
│    Service Income                $ 45,000                           │
│  TOTAL REVENUE                   $195,000                           │
│                                                                     │
│  EXPENSES                                                           │
│    Payroll                       $ 80,000                           │
│    Rent                          $ 12,000                           │
│    Utilities                     $  1,500                           │
│  TOTAL EXPENSES                  $ 93,500                           │
│                                                                     │
│  NET INCOME                      $101,500                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Mobile Experience

### Key Mobile Flows

- **Receipt Scan:** Primary use case. Fast camera access.
- **Invoice Approval:** Push notification -> "Approve Payment" for Managers.
- **CEO Dashboard:** Read-only view of Cash/Revenue widgets.

---

## 6. Integrations

- **Bank Feeds (Plaid):** Nightly transaction sync.
- **Stripe/PayPal:** Auto-record fees and net deposits.
- **Payroll Provider:** Import journal entries relative to wages/tax.
- **CRM:** Sync customer billing details.
