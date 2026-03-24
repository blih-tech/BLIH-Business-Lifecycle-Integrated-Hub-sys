# Finance API Documentation

**Module:** Finance & Accounting  
**Version:** 1.0  
**Last Updated:** February 2026  
**Base URL:** `/api/v1/finance`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Chart of Accounts](#2-chart-of-accounts)
3. [Journal Entries](#3-journal-entries)
4. [Invoices](#4-invoices)
5. [Payments](#5-payments)
6. [Reports](#6-reports)

---

## 1. Authentication

**Required Permissions:**

- `FINANCE:accounts:read` - View accounts
- `FINANCE:journal:write` - Create journal entries
- `FINANCE:invoices:read` - View invoices
- `FINANCE:payments:approve` - Approve payments

---

## 2. Chart of Accounts

### 2.1 List Accounts

```http
GET /api/v1/finance/accounts
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | enum | `ASSET`, `LIABILITY`, `EQUITY`, `REVENUE`, `EXPENSE` |
| `parent_id` | string | Filter by parent account |

**Response:**

```json
{
  "data": [
    {
      "id": "acct_1000",
      "code": "1000",
      "name": "Cash",
      "type": "ASSET",
      "parent_id": null,
      "balance": 125000.0,
      "currency": "USD",
      "status": "ACTIVE"
    }
  ]
}
```

### 2.2 Get Account Balance

```http
GET /api/v1/finance/accounts/:id/balance
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `as_of_date` | date | Balance as of date (default: today) |

**Response:**

```json
{
  "account_id": "acct_1000",
  "balance": 125000.0,
  "debits": 500000.0,
  "credits": 375000.0,
  "as_of_date": "2026-02-10",
  "currency": "USD"
}
```

---

## 3. Journal Entries

### 3.1 List Journal Entries

```http
GET /api/v1/finance/journal-entries
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `from_date` | date | Start date |
| `to_date` | date | End date |
| `status` | enum | `DRAFT`, `POSTED`, `VOIDED` |
| `reference` | string | Search by reference |

**Response:**

```json
{
  "data": [
    {
      "id": "je_abc123",
      "number": "JE-2026-001",
      "date": "2026-02-10",
      "description": "Monthly rent payment",
      "reference": "INV-5678",
      "status": "POSTED",
      "lines": [
        {
          "account_id": "acct_5000",
          "account_name": "Rent Expense",
          "debit": 5000.0,
          "credit": 0,
          "description": "Office rent - February"
        },
        {
          "account_id": "acct_1000",
          "account_name": "Cash",
          "debit": 0,
          "credit": 5000.0,
          "description": "Payment to landlord"
        }
      ],
      "created_by": "user_123",
      "posted_by": "user_456",
      "created_at": "2026-02-10T10:00:00Z",
      "posted_at": "2026-02-10T11:00:00Z"
    }
  ]
}
```

### 3.2 Create Journal Entry

```http
POST /api/v1/finance/journal-entries
```

**Request Body:**

```json
{
  "date": "2026-02-10",
  "description": "Monthly rent payment",
  "reference": "INV-5678",
  "lines": [
    {
      "account_id": "acct_5000",
      "debit": 5000.0,
      "description": "Office rent - February"
    },
    {
      "account_id": "acct_1000",
      "credit": 5000.0,
      "description": "Payment to landlord"
    }
  ]
}
```

**Response:** `201 Created`

> **Note:** Debits must equal credits. Entry is created in `DRAFT` status.

### 3.3 Post Journal Entry

```http
POST /api/v1/finance/journal-entries/:id/post
```

**Response:**

```json
{
  "id": "je_abc123",
  "status": "POSTED",
  "posted_by": "user_456",
  "posted_at": "2026-02-10T11:00:00Z"
}
```

> **SOX Control:** Requires `FINANCE:journal:post` permission. Creator cannot post their own entries (segregation of duties).

---

## 4. Invoices

### 4.1 List Invoices

```http
GET /api/v1/finance/invoices
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | enum | `DRAFT`, `SENT`, `PAID`, `OVERDUE`, `CANCELLED` |
| `customer_id` | string | Filter by customer |
| `due_before` | date | Due before date |

**Response:**

```json
{
  "data": [
    {
      "id": "inv_abc123",
      "number": "INV-2026-0042",
      "customer": {
        "id": "cust_xyz789",
        "name": "Acme Corp"
      },
      "issue_date": "2026-02-01",
      "due_date": "2026-03-01",
      "subtotal": 10000.0,
      "tax": 1500.0,
      "total": 11500.0,
      "paid_amount": 0,
      "balance_due": 11500.0,
      "currency": "USD",
      "status": "SENT",
      "line_items": [
        {
          "description": "Professional Services - January",
          "quantity": 80,
          "unit_price": 125.0,
          "amount": 10000.0
        }
      ]
    }
  ]
}
```

### 4.2 Create Invoice

```http
POST /api/v1/finance/invoices
```

**Request Body:**

```json
{
  "customer_id": "cust_xyz789",
  "issue_date": "2026-02-01",
  "due_date": "2026-03-01",
  "currency": "USD",
  "line_items": [
    {
      "description": "Professional Services - January",
      "quantity": 80,
      "unit_price": 125.0,
      "tax_rate": 0.15
    }
  ],
  "notes": "Payment terms: Net 30"
}
```

### 4.3 Send Invoice

```http
POST /api/v1/finance/invoices/:id/send
```

**Request Body:**

```json
{
  "email_to": "billing@acmecorp.com",
  "email_subject": "Invoice INV-2026-0042",
  "email_body": "Please find attached invoice for services rendered."
}
```

---

## 5. Payments

### 5.1 Record Payment

```http
POST /api/v1/finance/payments
```

**Request Body:**

```json
{
  "invoice_id": "inv_abc123",
  "amount": 11500.0,
  "payment_date": "2026-02-15",
  "payment_method": "BANK_TRANSFER",
  "reference": "TXN-20260215-001",
  "bank_account_id": "bank_123",
  "notes": "Payment received via wire transfer"
}
```

**Response:** `201 Created`

### 5.2 Create Payment Request

```http
POST /api/v1/finance/payment-requests
```

**Request Body:**

```json
{
  "vendor_id": "vend_456",
  "amount": 25000.0,
  "currency": "USD",
  "description": "Software licenses - Annual subscription",
  "due_date": "2026-02-20",
  "bank_account_id": "bank_123",
  "supporting_documents": ["doc_123", "doc_456"]
}
```

**Response:**

```json
{
  "id": "pay_req_789",
  "status": "PENDING_APPROVAL",
  "approval_workflow": {
    "level1": { "required_role": "FINANCE_MANAGER", "status": "PENDING" },
    "level2": { "required_role": "CFO", "status": "NOT_STARTED" }
  }
}
```

### 5.3 Approve Payment

```http
POST /api/v1/finance/payment-requests/:id/approve
```

**Request Body:**

```json
{
  "mfa_code": "123456", // Required for amounts >$50,000
  "notes": "Approved - budget available"
}
```

> **Security:** Maker-checker control. Requestor cannot approve their own payment.

---

## 6. Reports

### 6.1 Balance Sheet

```http
GET /api/v1/finance/reports/balance-sheet
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `as_of_date` | date | Report date (default: today) |
| `comparative` | boolean | Include prior period comparison |

**Response:**

```json
{
  "report_date": "2026-02-10",
  "assets": {
    "current_assets": {
      "cash": 125000.0,
      "accounts_receivable": 45000.0,
      "total": 170000.0
    },
    "fixed_assets": {
      "equipment": 50000.0,
      "total": 50000.0
    },
    "total_assets": 220000.0
  },
  "liabilities": {
    "current_liabilities": {
      "accounts_payable": 30000.0,
      "total": 30000.0
    },
    "total_liabilities": 30000.0
  },
  "equity": {
    "retained_earnings": 190000.0,
    "total_equity": 190000.0
  }
}
```

### 6.2 Profit & Loss

```http
GET /api/v1/finance/reports/profit-loss
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `from_date` | date | Start date |
| `to_date` | date | End date |
| `group_by` | enum | `MONTH`, `QUARTER`, `YEAR` |

**Response:**

```json
{
  "period": {
    "from": "2026-01-01",
    "to": "2026-01-31"
  },
  "revenue": {
    "service_revenue": 50000.0,
    "total_revenue": 50000.0
  },
  "expenses": {
    "salaries": 25000.0,
    "rent": 5000.0,
    "utilities": 1000.0,
    "total_expenses": 31000.0
  },
  "net_income": 19000.0
}
```

### 6.3 Cash Flow Statement

```http
GET /api/v1/finance/reports/cash-flow
```

**Response:**

```json
{
  "period": { "from": "2026-01-01", "to": "2026-01-31" },
  "operating_activities": {
    "net_income": 19000.0,
    "adjustments": {
      "accounts_receivable_decrease": 5000.0,
      "accounts_payable_increase": 3000.0
    },
    "net_cash_from_operations": 27000.0
  },
  "investing_activities": {
    "equipment_purchase": -15000.0,
    "net_cash_from_investing": -15000.0
  },
  "financing_activities": {
    "loan_proceeds": 20000.0,
    "net_cash_from_financing": 20000.0
  },
  "net_cash_increase": 32000.0,
  "beginning_cash": 93000.0,
  "ending_cash": 125000.0
}
```

---

## Error Handling

### Common Errors

| Code                    | Description                            |
| ----------------------- | -------------------------------------- |
| `UNBALANCED_ENTRY`      | Debits ≠ Credits in journal entry      |
| `SOD_VIOLATION`         | Segregation of duties violation        |
| `INSUFFICIENT_APPROVAL` | Payment requires higher approval level |
| `PERIOD_CLOSED`         | Accounting period is closed            |

---

## Rate Limits

- **Reports:** 20 requests/hour (resource-intensive)
- **Standard Operations:** 100 requests/minute

---

**Related Documentation:**

- [FINANCE_SECURITY.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/security/FINANCE_SECURITY.md) - SOX compliance
- [MODULE_FINANCE.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/modules/MODULE_FINANCE.md) - Features

**Last Updated:** February 2026
