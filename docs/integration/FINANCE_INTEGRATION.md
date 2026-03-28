# Finance Integration Guide

**Module:** Finance & Accounting  
**Version:** 1.0  
**Last Updated:** February 2026

---

## Table of Contents

1. [Integration Overview](#1-integration-overview)
2. [Banking & Payment Systems](#2-banking--payment-systems)
3. [Accounting Software](#3-accounting-software)
4. [Payment Gateways](#4-payment-gateways)
5. [Tax & Compliance](#5-tax--compliance)
6. [Payroll Systems](#6-payroll-systems)

---

## 1. Integration Overview

### 1.1 Supported Integrations

| Integration | Provider | Protocol | Sync Type | Status |
|-------------|----------|----------|-----------|--------|
| **Banking** | Plaid, Yodlee | REST API | Read-only | ✅ Active |
| **Accounting** | QuickBooks, Xero | OAuth 2.0 + API | Bi-directional | ✅ Active |
| **Payments** | Stripe, PayPal | Webhook + API | Bi-directional | ✅ Active |
| **Tax** | Avalara | REST API | One-way | ✅ Active |
| **Payroll** | Gusto, ADP | REST API | Read-only | 🚧 Beta |

### 1.2 Integration Architecture

```
┌──────────────────────────────────────────────┐
│  BLIH Finance Module                         │
├──────────────────────────────────────────────┤
│  Integration Service                         │
│  ├─ Bank Feed Sync (Plaid)                   │
│  ├─ Payment Processor (Stripe)               │
│  ├─ Accounting Sync (QuickBooks/Xero)        │
│  └─ Tax Calculator (Avalara)                 │
└──────────────────────────────────────────────┘
         ↓                    ↓                  ↓
    [Bank API]         [Stripe API]      [QuickBooks API]
```

---

## 2. Banking & Payment Systems

### 2.1 Plaid Bank Integration

**Purpose:** Automatic bank transaction import

**Setup:**
```bash
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox  # or production
```

**Link Bank Account:**
```http
POST /api/v1/integrations/plaid/link
```

**Request:**
```json
{
  "user_id": "user_123",
  "products": ["transactions", "balance"],
  "country_codes": ["US", "ET"],
  "language": "en"
}
```

**Response:**
```json
{
  "link_token": "link-sandbox-abc123...",
  "expiration": "2026-02-10T18:00:00Z",
  "link_url": "https://cdn.plaid.com/link/v2/stable/link.html?token=..."
}
```

**Transaction Sync:**
```http
POST /api/v1/integrations/plaid/sync-transactions
```

**Request:**
```json
{
  "account_id": "plaid_acct_123",
  "start_date": "2026-01-01",
  "end_date": "2026-01-31"
}
```

**Response:**
```json
{
  "transactions": [
    {
      "transaction_id": "plaid_txn_456",
      "date": "2026-01-15",
      "description": "Office Depot Purchase",
      "amount": -125.50,
      "category": ["Shops", "Office Supplies"],
      "pending": false,
      "suggested_account": "acct_5100",  // Office Supplies Expense
      "auto_categorized": true
    }
  ],
  "synced_count": 145,
  "job_id": "sync_job_789"
}
```

**Auto-Categorization Rules:**
```json
{
  "categorization_rules": [
    {
      "merchant_pattern": "AWS",
      "account_code": "5200",  // Cloud Services Expense
      "department": "Engineering"
    },
    {
      "merchant_pattern": "WeWork|Regus",
      "account_code": "5000",  // Rent Expense
      "department": "General"
    }
  ]
}
```

### 2.2 Yodlee Bank Feed

**Alternative to Plaid** (better international bank coverage)

```http
POST /api/v1/integrations/yodlee/link
```

**Features:**
- 15,000+ financial institutions
- Global coverage (100+ countries)
- Real-time balance updates

---

## 3. Accounting Software

### 3.1 QuickBooks Online Integration

**OAuth 2.0 Setup:**
```bash
QUICKBOOKS_CLIENT_ID=your_client_id
QUICKBOOKS_CLIENT_SECRET=your_client_secret
QUICKBOOKS_REDIRECT_URI=https://your-blih.com/api/v1/integrations/quickbooks/callback
```

**Authorization:**
```http
GET /api/v1/integrations/quickbooks/authorize
```

**Bi-Directional Sync:**

**BLIH → QuickBooks:**
```json
{
  "sync_to_quickbooks": {
    "invoices": true,
    "payments": true,
    "customers": true,
    "vendors": true,
    "journal_entries": false  // Manual only
  }
}
```

**QuickBooks → BLIH:**
```json
{
  "import_from_quickbooks": {
    "chart_of_accounts": true,
    "customer_payments": true,
    "bills": true,
    "tax_rates": true
  }
}
```

**Example: Sync Invoice**
```typescript
// When invoice created in BLIH
POST /api/v1/finance/invoices
{
  "customer_id": "cust_123",
  "line_items": [...],
  "sync_to_quickbooks": true  // Auto-creates in QuickBooks
}

// QuickBooks invoice ID stored for reference
{
  "id": "inv_blih_456",
  "quickbooks_id": "qb_inv_789",
  "synced_at": "2026-02-10T14:00:00Z"
}
```

**Field Mapping:**
| BLIH | QuickBooks |
|------|------------|
| Customer | Customer |
| Invoice | Invoice |
| Payment | Payment |
| Account | Account |
| Journal Entry | Journal Entry |

### 3.2 Xero Integration

**OAuth 2.0 + REST API**

```http
GET /api/v1/integrations/xero/authorize
```

**Scopes:**
- `accounting.transactions`
- `accounting.contacts`
- `accounting.settings.read`

**Features:**
- Chart of accounts sync
- Invoice & bill sync
- Bank reconciliation data import
- Multi-currency support

**Webhook for Real-Time Sync:**
```http
POST /api/v1/integrations/xero/webhook
```

Xero notifies BLIH of:
- Invoice paid
- Contact created
- Bank transaction imported

---

## 4. Payment Gateways

### 4.1 Stripe Integration

**Setup:**
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Accept Payments:**
```http
POST /api/v1/finance/invoices/:id/create-payment-link
```

**Request:**
```json
{
  "payment_method": "stripe",
  "success_url": "https://your-site.com/payment-success",
  "cancel_url": "https://your-site.com/payment-cancel"
}
```

**Response:**
```json
{
  "payment_url": "https://checkout.stripe.com/pay/cs_test_abc123...",
  "expires_at": "2026-02-11T14:00:00Z"
}
```

**Webhook Handler:**
```typescript
// Stripe webhook endpoint
POST /api/v1/integrations/stripe/webhook

// Events handled:
// - payment_intent.succeeded → Mark invoice as paid
// - charge.refunded → Create credit note
// - customer.subscription.updated → Update recurring invoice
```

**Auto-Reconciliation:**
```typescript
// When Stripe payment received
{
  "event": "payment_intent.succeeded",
  "data": {
    "invoice_id": "inv_blih_456",
    "amount": 11500.00,
    "stripe_payment_id": "pi_abc123"
  }
}

// Auto-creates journal entry:
// Debit:  Cash (Stripe)  $11,500
// Credit: Accounts Receivable  $11,500
```

### 4.2 PayPal Integration

**REST API:**
```bash
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=live  # or sandbox
```

**Invoice Payment via PayPal:**
```http
POST /api/v1/finance/invoices/:id/paypal-checkout
```

**Features:**
- PayPal Checkout buttons
- Recurring billing
- Multi-currency
- Automatic payment recording

### 4.3 Bank Wire Transfer

**Manual Payment Recording:**
```http
POST /api/v1/finance/payments
{
  "invoice_id": "inv_456",
  "amount": 50000.00,
  "payment_method": "BANK_WIRE",
  "reference": "Wire-20260210-001",
  "received_date": "2026-02-10"
}
```

---

## 5. Tax & Compliance

### 5.1 Avalara Tax Calculation

**Real-Time Sales Tax:**
```bash
AVALARA_ACCOUNT_ID=your_account_id
AVALARA_LICENSE_KEY=your_license_key
AVALARA_ENV=production
```

**Calculate Tax on Invoice:**
```http
POST /api/v1/integrations/avalara/calculate-tax
```

**Request:**
```json
{
  "invoice_id": "inv_456",
  "from_address": {
    "line1": "123 Company St",
    "city": "Addis Ababa",
    "country": "Ethiopia"
  },
  "to_address": {
    "line1": "456 Client Ave",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  },
  "line_items": [
    {
      "amount": 10000.00,
      "description": "Software License",
      "tax_code": "SW054000"  // Software as a Service
    }
  ]
}
```

**Response:**
```json
{
  "total_tax": 875.00,
  "tax_details": [
    {
      "jurisdiction": "New York State",
      "rate": 0.04,
      "tax": 400.00
    },
    {
      "jurisdiction": "New York City",
      "rate": 0.0475,
      "tax": 475.00
    }
  ],
  "invoice_total": 10875.00
}
```

**Auto-Apply Tax:**
- Tax automatically calculated on invoice creation
- Jurisdiction rules applied based on addresses
- Compliance with nexus rules

### 5.2 VAT/GST Calculation (Ethiopia)

**Ethiopian Tax Rules:**
```json
{
  "ethiopia_vat": {
    "standard_rate": 0.15,  // 15% VAT
    "exempt_services": ["healthcare", "education"],
    "withholding_tax": {
      "services": 0.02,  // 2% WHT on services
      "goods": 0.03      // 3% WHT on goods
    }
  }
}
```

**TIN Validation:**
```http
POST /api/v1/integrations/tax/validate-tin
{
  "tin": "0123456789",
  "country": "ET"
}
```

---

## 6. Payroll Systems

### 6.1 Gusto Integration (Beta)

**Import Payroll Data:**
```http
POST /api/v1/integrations/gusto/sync-payroll
```

**Request:**
```json
{
  "pay_period_start": "2026-02-01",
  "pay_period_end": "2026-02-15"
}
```

**Response:**
```json
{
  "employees_paid": 50,
  "total_gross_pay": 125000.00,
  "total_taxes": 31250.00,
  "total_net_pay": 93750.00,
  "journal_entry_id": "je_payroll_123"
}
```

**Auto-Created Journal Entry:**
```
Debit:  Salaries Expense    $125,000
Debit:  Payroll Tax Expense $31,250
Credit: Cash                $93,750
Credit: Tax Payable         $31,250
Credit: Other Payables      $31,250
```

### 6.2 ADP Integration (Beta)

**API-Based Sync:**
```bash
ADP_CLIENT_ID=your_client_id
ADP_CLIENT_SECRET=your_client_secret
```

**Features:**
- Payroll data import
- Employee cost center allocation
- Benefits deductions tracking

---

## Integration Security

### Financial Data Encryption

**All financial data encrypted:**
- Bank account numbers: AES-256 + tokenization
- Payment card data: PCI-DSS Level 1 compliant
- API keys: Stored in HashiCorp Vault

### Audit Trail

**All integrations logged:**
```json
{
  "action": "PAYMENT_RECEIVED_STRIPE",
  "invoice_id": "inv_456",
  "amount": 11500.00,
  "stripe_payment_id": "pi_abc123",
  "user_id": "system",
  "timestamp": "2026-02-10T14:00:00Z"
}
```

### SOX Compliance

- Segregation of duties enforced
- Approval workflows maintained
- Immutable audit logs
- Quarterly access reviews

---

## Troubleshooting

### Bank Sync Issues

**Plaid Connection Expired:**
```bash
# Re-authenticate
GET /api/v1/integrations/plaid/relink?account_id=plaid_acct_123

# Check status
GET /api/v1/integrations/plaid/status
```

### QuickBooks Sync Errors

**Token Expired:**
```bash
# Auto-refresh (happens automatically)
POST /api/v1/integrations/quickbooks/refresh

# Manual re-authorization if refresh fails
GET /api/v1/integrations/quickbooks/authorize
```

**Sync Conflicts:**
- BLIH is source of truth for invoices
- QuickBooks is source of truth for bank transactions
- Manual resolution required for conflicts

---

**Related Documentation:**
- [FINANCE_API.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/api/FINANCE_API.md) - Finance API reference
- [FINANCE_SECURITY.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/security/FINANCE_SECURITY.md) - Security & compliance
- [MODULE_FINANCE.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/modules/MODULE_FINANCE.md) - Finance features

**Last Updated:** February 2026
