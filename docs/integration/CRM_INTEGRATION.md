# CRM Integration Guide

**Module:** Customer Relationship Management  
**Version:** 1.0  
**Last Updated:** February 2026

---

## Table of Contents

1. [Integration Overview](#1-integration-overview)
2. [Email Integration](#2-email-integration)
3. [Calendar Integration](#3-calendar-integration)
4. [Third-Party CRM Systems](#4-third-party-crm-systems)
5. [Marketing Automation](#5-marketing-automation)
6. [Social Media](#6-social-media)

---

## 1. Integration Overview

### 1.1 Supported Integrations

| Integration      | Provider                 | Protocol      | Sync Type          | Status    |
| ---------------- | ------------------------ | ------------- | ------------------ | --------- |
| **Email**        | Gmail, Outlook 365       | OAuth 2.0     | Bi-directional     | ✅ Active |
| **Calendar**     | Google Calendar, Outlook | OAuth 2.0     | Bi-directional     | ✅ Active |
| **CRM Import**   | Salesforce, HubSpot      | REST API      | One-time/Scheduled | ✅ Active |
| **Marketing**    | Mailchimp, SendGrid      | Webhook + API | One-way (CRM→Tool) | ✅ Active |
| **Social Media** | LinkedIn, Twitter        | OAuth 2.0     | Read-only          | 🚧 Beta   |

### 1.2 Integration Architecture

```
┌─────────────────────────────────────────────┐
│  BLIH CRM Module                            │
├─────────────────────────────────────────────┤
│  Integration Service                        │
│  ├─ OAuth Token Manager                     │
│  ├─ Webhook Handler                         │
│  ├─ Sync Queue (RabbitMQ)                   │
│  └─ Rate Limiter                            │
└─────────────────────────────────────────────┘
         ↓                    ↓                  ↓
    [Gmail API]      [Calendar API]    [Salesforce API]
```

---

## 2. Email Integration

### 2.1 Gmail Integration

**Setup Process:**

1. **Enable Gmail API in Google Cloud Console**
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-blih-instance.com/api/v1/integrations/gmail/callback`

2. **Configure BLIH**

```bash
# Environment variables
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REDIRECT_URI=https://your-blih-instance.com/api/v1/integrations/gmail/callback
```

3. **User Authorization Flow**

```typescript
// Step 1: Initiate OAuth flow
GET /api/v1/integrations/gmail/authorize

// Step 2: User grants permissions (Gmail scopes)
// - gmail.readonly
// - gmail.send
// - gmail.modify

// Step 3: Exchange code for token
POST /api/v1/integrations/gmail/callback
{
  "code": "authorization_code_from_google"
}

// Response: Token stored securely in Vault
{
  "status": "connected",
  "email": "user@gmail.com",
  "scopes": ["gmail.readonly", "gmail.send"]
}
```

**Features:**

✅ **Automatic Email Sync**

- Sync emails with CRM contacts
- Create communication records automatically
- Attach emails to customer/deal records

✅ **Send Emails from BLIH**

```typescript
POST /api/v1/crm/customers/:id/send-email
{
  "subject": "Follow-up on our meeting",
  "body": "Hi John, thank you for...",
  "use_gmail": true  // Send via connected Gmail
}
```

✅ **Email Templates**

- Pre-built templates with variables
- Track open rates and clicks
- Schedule emails for later

### 2.2 Outlook 365 Integration

**Setup:**

```typescript
// Microsoft Graph API configuration
OUTLOOK_CLIENT_ID = your_client_id;
OUTLOOK_CLIENT_SECRET = your_client_secret;
OUTLOOK_TENANT_ID = your_tenant_id;

// OAuth 2.0 Scopes
const scopes = ['Mail.Read', 'Mail.Send', 'Mail.ReadWrite'];
```

**API Endpoint:**

```http
GET /api/v1/integrations/outlook/authorize
```

**Features:** Same as Gmail (bi-directional sync, send, templates)

### 2.3 Email Sync Configuration

```json
{
  "sync_settings": {
    "enabled": true,
    "sync_frequency": "realtime", // or "hourly", "daily"
    "sync_direction": "bidirectional",
    "auto_create_contacts": true,
    "sync_folders": ["INBOX", "Sent"],
    "exclude_folders": ["Spam", "Trash"],
    "date_range": {
      "from": "2026-01-01",
      "to": null // null = ongoing
    }
  }
}
```

---

## 3. Calendar Integration

### 3.1 Google Calendar

**Setup:**

```bash
GOOGLE_CALENDAR_CLIENT_ID=your_client_id
GOOGLE_CALENDAR_CLIENT_SECRET=your_client_secret
```

**OAuth Scopes:**

- `calendar.events.readonly` - Read events
- `calendar.events` - Create/modify events

**Features:**

✅ **Two-Way Sync**

```typescript
// CRM Activity → Google Calendar Event
POST /api/v1/crm/activities
{
  "type": "MEETING",
  "subject": "Product Demo - Acme Corp",
  "customer_id": "cust_123",
  "scheduled_at": "2026-02-15T14:00:00Z",
  "duration_minutes": 60,
  "sync_to_calendar": true
}

// Auto-creates Google Calendar event
// Attendees: CRM customer + sales rep
```

✅ **Calendar Event → CRM Activity**

- Events with `[CRM]` tag auto-sync to BLIH
- Example: `[CRM] Meeting with John Doe`

**Sync Rules:**

```json
{
  "calendar_sync": {
    "tag_filter": "[CRM]",
    "auto_link_contacts": true,
    "privacy": "confidential", // Hide details in calendar
    "reminder_offset_minutes": 15
  }
}
```

### 3.2 Outlook Calendar

**Microsoft Graph API:**

```http
GET /api/v1/integrations/outlook-calendar/authorize
```

**Scopes:**

- `Calendars.Read`
- `Calendars.ReadWrite`

Same features as Google Calendar.

---

## 4. Third-Party CRM Systems

### 4.1 Salesforce Import

**One-Time Import:**

```http
POST /api/v1/integrations/salesforce/import
```

**Request:**

```json
{
  "salesforce_instance": "https://yourcompany.salesforce.com",
  "username": "admin@yourcompany.com",
  "password": "encrypted_password",
  "security_token": "salesforce_security_token",
  "objects_to_import": ["Account", "Contact", "Opportunity"],
  "date_filter": {
    "from": "2025-01-01"
  }
}
```

**Response:**

```json
{
  "job_id": "import_job_123",
  "status": "STARTED",
  "estimated_records": 5000,
  "progress_url": "/api/v1/integrations/salesforce/import/import_job_123"
}
```

**Mapping:**
| Salesforce | BLIH CRM |
|------------|----------|
| Account | Customer |
| Contact | Contact |
| Opportunity | Deal |
| Task | Activity |

### 4.2 HubSpot Import

**API-Based Import:**

```http
POST /api/v1/integrations/hubspot/import
```

**Request:**

```json
{
  "api_key": "your_hubspot_api_key",
  "objects": ["companies", "contacts", "deals"],
  "sync_mode": "incremental" // or "full"
}
```

**Webhook Setup (Real-time sync):**

```http
POST /api/v1/integrations/hubspot/webhook
```

HubSpot webhooks notify BLIH of:

- New company created
- Contact updated
- Deal stage changed

### 4.3 CSV/Excel Import

**Bulk Import:**

```http
POST /api/v1/crm/import/csv
Content-Type: multipart/form-data
```

**Form Data:**

- `file`: CSV/Excel file
- `mapping`: JSON field mapping
- `duplicate_handling`: `skip` | `update` | `create_new`

**Example Mapping:**

```json
{
  "mapping": {
    "Company Name": "company",
    "First Name": "firstName",
    "Last Name": "lastName",
    "Email Address": "email",
    "Phone": "phone"
  }
}
```

---

## 5. Marketing Automation

### 5.1 Mailchimp Integration

**Setup:**

```bash
MAILCHIMP_API_KEY=your_api_key
MAILCHIMP_SERVER_PREFIX=us1  # From your Mailchimp account
```

**Sync Customers to Mailchimp Audience:**

```http
POST /api/v1/integrations/mailchimp/sync
```

**Request:**

```json
{
  "audience_id": "mailchimp_list_123",
  "segment": {
    "status": "CUSTOMER",
    "tags": ["enterprise"]
  },
  "sync_mode": "add_only" // or "bidirectional"
}
```

**Webhook (Campaign Activity → CRM):**

- Track email opens
- Track link clicks
- Update customer engagement score

### 5.2 SendGrid Integration

**Email Campaigns:**

```typescript
POST /api/v1/integrations/sendgrid/campaign
{
  "template_id": "sendgrid_template_123",
  "recipients": {
    "customer_segment": "high_value",
    "personalization": {
      "firstName": "{{customer.firstName}}",
      "company": "{{customer.company}}"
    }
  }
}
```

---

## 6. Social Media

### 6.1 LinkedIn Integration (Beta)

**Features:**

- Import LinkedIn connections as leads
- Track LinkedIn InMail conversations
- Post updates from BLIH

**Setup:**

```http
GET /api/v1/integrations/linkedin/authorize
```

**Scopes:**

- `r_basicprofile`
- `r_emailaddress`
- `w_member_social`

### 6.2 Twitter Integration (Beta)

**Use Case:** Social listening for brand mentions

```http
POST /api/v1/integrations/twitter/monitor
{
  "keywords": ["@YourCompany", "#YourProduct"],
  "auto_create_leads": true
}
```

---

## Integration Security

### OAuth Token Management

**Token Storage:**

- All OAuth tokens encrypted in HashiCorp Vault
- Automatic token refresh before expiry
- Token rotation every 90 days

**Audit Logging:**

```typescript
// All integration actions logged
{
  "action": "EMAIL_SENT_VIA_GMAIL",
  "user_id": "user_123",
  "customer_id": "cust_456",
  "email_subject": "Follow-up...",
  "timestamp": "2026-02-10T14:00:00Z"
}
```

### Rate Limiting

| Provider        | Rate Limit       | BLIH Throttling |
| --------------- | ---------------- | --------------- |
| Gmail API       | 250 req/sec      | 50 req/sec      |
| Google Calendar | 500 req/100sec   | 100 req/100sec  |
| Outlook         | 10,000 req/10min | 2,000 req/10min |
| Salesforce      | 100,000 req/24hr | 20,000 req/24hr |

---

## Troubleshooting

### Common Issues

**Gmail Sync Not Working:**

```bash
# Check token validity
GET /api/v1/integrations/gmail/status

# Refresh token manually
POST /api/v1/integrations/gmail/refresh

# Re-authorize if needed
GET /api/v1/integrations/gmail/authorize
```

**Calendar Events Not Syncing:**

- Verify `[CRM]` tag is present
- Check sync settings: `GET /api/v1/integrations/calendar/settings`
- Review sync logs: `GET /api/v1/integrations/calendar/logs`

---

**Related Documentation:**

- [CRM_API.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/api/CRM_API.md) - CRM API reference
- [CRM_SECURITY.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/security/CRM_SECURITY.md) - Security controls
- [MODULE_CRM.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/modules/MODULE_CRM.md) - CRM features

**Last Updated:** February 2026
