# CRM Security Documentation

**Module:** Customer Relationship Management  
**Version:** 1.0  
**Last Updated:** February 2026  
**Criticality:** 🟡 HIGH (Customer Data, GDPR)

---

## Table of Contents

1. [Security Overview](#1-security-overview)
2. [Data Classification](#2-data-classification)
3. [Access Control](#3-access-control)
4. [GDPR Compliance](#4-gdpr-compliance)
5. [Third-Party Integrations](#5-third-party-integrations)
6. [Audit & Monitoring](#6-audit--monitoring)

---

## 1. Security Overview

### 1.1 Threat Model

| Threat | Impact | Likelihood | Mitigation |
|--------|--------|------------|------------|
| **Unauthorized customer data access** | High | Medium | RBAC, audit logs |
| **GDPR violations** | Critical | Low | Consent tracking, data retention |
| **Email integration compromise** | High | Low | OAuth 2.0, token encryption |
| **Data exfiltration** | Critical | Low | DLP, export monitoring |
| **Customer PII exposure** | High | Medium | Field-level encryption |

### 1.2 Security Controls Summary

```typescript
// CRM Security Architecture
const crmSecurity = {
  authentication: "Keycloak SSO + MFA",
  authorization: "RBAC (Sales team hierarchy)",
  dataProtection: {
    atRest: "AES-256-GCM",
    inTransit: "TLS 1.3",
    fieldLevel: ["email", "phone", "notes"]
  },
  compliance: ["GDPR", "ISO 27001"],
  auditLogging: "All CRUD operations on customers/deals"
};
```

---

## 2. Data Classification

### 2.1 CRM Data Sensitivity

| Data Type | Classification | Encryption | Retention |
|-----------|----------------|------------|-----------|
| **Customer PII** | Confidential | ✅ Field-level | Active + 5 years |
| **Contact Info** | Internal | ✅ At rest | Active + 5 years |
| **Deal Values** | Confidential | ✅ At rest | 7 years (tax) |
| **Communication History** | Internal | ✅ At rest | Active + 2 years |
| **Email Content** | Confidential | ✅ At rest | Active + 1 year |
| **Notes & Attachments** | Confidential | ✅ At rest + field | Active + 2 years |

###2.2 GDPR Personal Data Inventory

```typescript
// GDPR-protected fields in CRM
const gdprFields = {
  customers: [
    "firstName", "lastName", "email", "phone",
    "address", "birthDate", "taxId"
  ],
  contacts: [
    "name", "email", "phone", "position"
  ],
  communications: [
    "emailContent", "notes", "attachments"
  ]
};
```

---

## 3. Access Control

### 3.1 CRM Permissions Matrix

| Role | View All | Create | Edit Own | Edit All | Delete | Export |
|------|----------|--------|----------|----------|--------|--------|
| **Sales Rep** | Own leads/deals | ✅ | ✅ | ❌ | ❌ | Own data |
| **Sales Manager** | Team data | ✅ | ✅ | ✅ Team | ❌ | Team data |
| **Sales Director** | All data | ✅ | ✅ | ✅ | ⚠️ Soft delete | All data |
| **Admin** | All data | ✅ | ✅ | ✅ | ✅ | All data |

### 3.2 Deal Visibility Rules

```typescript
// Deal access control
async function canAccessDeal(user: User, dealId: string): Promise<boolean> {
  const deal = await dealRepo.findOne({ id: dealId });
  
  // Company isolation (critical!)
  if (deal.company_id !== user.company_id) {
    return false;
  }
  
  // Owner can always access
  if (deal.owner_id === user.id) {
    return true;
  }
  
  // Manager can access team deals
  if (user.hasRole('SALES_MANAGER')) {
    const isMyTeamMember = await isTeamMember(deal.owner_id, user.id);
    return isMyTeamMember;
  }
  
  // Director/Admin can access all
  if (user.hasAnyRole(['SALES_DIRECTOR', 'ADMIN'])) {
    return true;
  }
  
  return false;
}
```

### 3.3 Field-Level Security

```typescript
// Sensitive field masking for non-owners
function maskCustomerData(customer: Customer, user: User): Partial<Customer> {
  if (customer.owner_id !== user.id && !user.hasRole('ADMIN')) {
    return {
      ...customer,
      email: maskEmail(customer.email),     // j***@example.com
      phone: maskPhone(customer.phone),     // +251-***-****
      taxId: "***MASKED***",
      notes: "[REDACTED]"
    };
  }
  return customer;
}
```

---

## 4. GDPR Compliance

### 4.1 Consent Management

```typescript
// Track customer consent
interface CustomerConsent {
  customerId: string;
  purpose: 'marketing' | 'analytics' | 'communications';
  granted: boolean;
  timestamp: Date;
  ip_address: string;
  expiresAt?: Date;
}

// Before sending marketing emails
async function canSendMarketing(customerId: string): Promise<boolean> {
  const  consent = await consentRepo.findOne({
    customerId,
    purpose: 'marketing',
    granted: true
  });
  
  if (!consent) return false;
  if (consent.expiresAt && consent.expiresAt < new Date()) return false;
  
  return true;
}
```

### 4.2 Right to be Forgotten

```typescript
// GDPR Article 17: Right to Erasure
async function deleteCustomerData(customerId: string, reason: string) {
  await db.transaction(async (tx) => {
    // Anonymize personal data (keep structure for analytics)
    await tx.update('customers').set({
      firstName: "DELETED",
      lastName: "USER",
      email: `deleted-${randomUUID()}@deleted.local`,
      phone: null,
      address: null,
      taxId: null,
      gdpr_deleted: true,
      gdpr_deleted_at: new Date(),
      gdpr_deletion_reason: reason
    }).where({ id: customerId });
    
    // Anonymize related data
    await tx.update('contacts').set({
      name: "DELETED",
      email: null,
      phone: null
    }).where({ customerId });
    
    // Delete attachments from storage
    await deleteCustomerAttachments(customerId);
    
    // Create audit log (immutable)
    await auditLog({
      action: 'GDPR_DELETE',
      entity: 'customer',
      entityId: customerId,
      reason
    });
  });
}
```

### 4.3 Data Portability

```typescript
// GDPR Article 20: Data Portability
async function exportCustomerData(customerId: string): Promise<object> {
  return {
    customer: await customerRepo.findOne({ id: customerId }),
    contacts: await contactRepo.find({ customerId }),
    deals: await dealRepo.find({ customerId }),
    activities: await activityRepo.find({ customerId }),
    communications: await communicationRepo.find({ customerId }),
    consents: await consentRepo.find({ customerId }),
    exportedAt: new Date().toISOString(),
    format: "JSON",
    gdprCompliant: true
  };
}
```

---

## 5. Third-Party Integrations

### 5.1 Email Integration Security

```typescript
// OAuth 2.0 for email access
const emailIntegration = {
  provider: "Gmail/Outlook",
  protocol: "OAuth 2.0",
  scopes: ["read", "send"],
  tokenStorage: "HashiCorp Vault",
  tokenExpiry: "1 hour",
  refreshTokenRotation: true
};

// Secure token storage
async function storeEmailToken(userId: string, token: OAuthToken) {
  const encryptedToken = await encrypt(JSON.stringify(token));
  
  await vault.write(`email-tokens/${userId}`, {
    access_token: encryptedToken,
    expires_at: token.expiresAt,
    scopes: token.scopes
  });
}
```

### 5.2 Calendar Integration

```typescript
// Calendar sync security
const calendarSecurity = {
  // Only sync CRM-related events
  filterEvents: (event) => event.title.includes('[CRM]'),
  
  // Never sync sensitive notes
  excludedFields: ['privateNotes', 'internalComments'],
  
  // OAuth with minimal scopes
  scopes: ['calendar.events.read', 'calendar.events.write'],
  
  // Periodic token validation
  tokenValidation: 'hourly'
};
```

---

## 6. Audit & Monitoring

### 6.1 Audit Log Examples

```typescript
// All CRM operations are logged
const auditExamples = [
  {
    action: 'CUSTOMER_CREATED',
    user_id: 'user-123',
    entity: 'customer',
    entity_id: 'cust-456',
    changes: { firstName: 'John', lastName: 'Doe' },
    ip: '192.168.1.100',
    timestamp: '2026-02-10T14:00:00Z'
  },
  {
    action: 'DEAL_VALUE_CHANGED',
    user_id: 'user-123',
    entity: 'deal',
    entity_id: 'deal-789',
    changes: { value: { from: 10000, to: 15000 } },
    reason: 'Scope expanded',
    timestamp: '2026-02-10T14:05:00Z'
  },
  {
    action: 'CUSTOMER_DATA_EXPORTED',
    user_id: 'user-123',
    entity: 'customer',
    entity_id: 'cust-456',
    exportFormat: 'CSV',
    recordCount: 150,
    timestamp: '2026-02-10T14:10:00Z'
  }
];
```

### 6.2 Security Monitoring

```typescript
// CRM-specific security alerts
const securityMonitoring = {
  alerts: [
    {
      name: "Bulk Customer Export",
      condition: "export_count > 100 in 1 hour",
      severity: "WARNING",
      action: "Notify security team"
    },
    {
      name: "After-Hours Customer Access",
      condition: "access_time outside business hours",
      severity: "INFO",
      action: "Log for review"
    },
    {
      name: "Sensitive Field Access Spike",
      condition: "phone/email access > 50 in 5 min",
      severity: "WARNING",
      action: "Rate limit + notify manager"
    }
  ]
};
```

---

## Security Checklist

### CRM Security Review

**Data Protection:**
- [ ] All customer PII encrypted at rest
- [ ] Email/phone fields encrypted
- [ ] Notes and attachments encrypted
- [ ] Data retention policy configured (5 years)
- [ ] Automated data archival in place

** GDPR Compliance:**
- [ ] Consent tracking implemented
- [ ] Right to access (data export) functional
- [ ] Right to be forgotten (deletion) functional
- [ ] Data processing notices displayed
- [ ] Privacy policy accessible

**Access Control:**
- [ ] RBAC configured for all CRM roles
- [ ] Deal ownership rules enforced
- [ ] Team-based access working correctly
- [ ] Field-level masking implemented

**Third-Party:**
- [ ] OAuth 2.0 for email integration
- [ ] Tokens stored in Vault
- [ ] Minimal scopes requested
- [ ] Token rotation configured

**Audit & Monitoring:**
- [ ] All CRUD operations logged
- [ ] Export activities monitored
- [ ] Security alerts configured
- [ ] Quarterly access reviews scheduled

---

**Related Documentation:**
- [SECURITY_OVERVIEW.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/security/SECURITY_OVERVIEW.md) - System-wide security
- [CRM_API.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/api/CRM_API.md) - API security
- [MODULE_CRM.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/modules/MODULE_CRM.md) - CRM features

**Last Updated:** February 2026  
**Maintained by:** Security Team
