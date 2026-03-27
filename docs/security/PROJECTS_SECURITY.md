# Projects Security Documentation

**Module:** Project Management  
**Version:** 1.0  
**Last Updated:** February 2026  
**Criticality:** 🟡 HIGH (Client Confidentiality, IP Protection)

---

## Table of Contents

1. [Security Overview](#1-security-overview)
2. [Project Access Control](#2-project-access-control)
3. [Document Security](#3-document-security)
4. [Client Confidentiality](#4-client-confidentiality)
5. [Time Tracking Security](#5-time-tracking-security)
6. [Audit & Compliance](#6-audit--compliance)

---

## 1. Security Overview

### 1.1 Threat Model

| Threat | Impact | Likelihood | Mitigation |
|--------|--------|------------|------------|
| **Unauthorized project access** | High | Medium | Project-level ACL |
| **Document leakage** | High | Low | Encryption + DRM |
| **Client data exposure** | Critical | Low | Compartmentalization |
| **IP theft** | High | Low | Access logs, watermarking |
| **Time tracking fraud** | Medium | Medium | Audit trails, manager review |

### 1.2 Security Architecture

```typescript
const projectsSecurity = {
  accessControl: "Project-level + role-based",
  documentProtection: {
    encryption: "AES-256",
    versioning: "Immutable history",
    watermarking: "Optional for sensitive docs"
  },
  clientIsolation: "Strict compartmentalization",
  timeSecurity: "GPS verification (optional)",
  auditLogging: "All project accesses logged"
};
```

---

## 2. Project Access Control

### 2.1 Project Permissions Matrix

| Role | View Project | Edit | Add Members | Delete | View Financials |
|------|-------------|------|-------------|--------|-----------------|
| **Project Member** | ✅ | ✅ Own tasks | ❌ | ❌ | ❌ |
| **Project Manager** | ✅ | ✅ All | ✅ | ⚠️ Soft delete | ✅ |
| **Portfolio Manager** | ✅ All projects | ❌ | ❌ | ❌ | ✅ All |
| **Admin** | ✅ All | ✅ All | ✅ | ✅ | ✅ All |

### 2.2 Project-Level Access Control

```typescript
// Project Access Control List (ACL)
interface ProjectACL {
  projectId: string;
  userId: string;
  role: 'MEMBER' | 'LEAD' | 'MANAGER' | 'OBSERVER';
  permissions: string[];  // ['tasks:read', 'tasks:write', 'docs:read']
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;      // Optional time-based access
}

// Check project access
async function canAccessProject(user: User, projectId: string): Promise<boolean> {
  // Company isolation (critical!)
  const project = await projectRepo.findOne({ id: projectId });
  if (project.company_id !== user.company_id) {
    return false;
  }
  
  // Check ACL
  const acl = await projectACL.findOne({
    projectId,
    userId: user.id
  });
  
  if (acl && (!acl.expiresAt || acl.expiresAt > new Date())) {
    return true;
  }
  
  // Portfolio managers can view all
  if (user.hasRole('PORTFOLIO_MANAGER')) {
    return true;
  }
  
  return false;
}

// Grant project access (audit logged)
async function grantProjectAccess(
  projectId: string,
  userId: string,
  role: string,
  grantedBy: User
) {
  // Check granter has permission
  if (!await canGrantAccess(grantedBy, projectId)) {
    throw new ForbiddenException('Cannot grant access to this project');
  }
  
  const acl = await projectACL.save({
    projectId,
    userId,
    role,
    permissions: getRolePermissions(role),
    grantedBy: grantedBy.id,
    grantedAt: new Date()
  });
  
  // Audit log
  await auditLog({
    action: 'PROJECT_ACCESS_GRANTED',
    project_id: projectId,
    target_user_id: userId,
    granted_by: grantedBy.id,
    role
  });
  
  return acl;
}
```

### 2.3 Client-Specific Projects

```typescript
// Projects tied to specific clients require additional access control
interface ClientProject {
  projectId: string;
  clientId: string;
  confidentialityLevel: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'TOP_SECRET';
  nda_required: boolean;
  nda_signed_by: string[];  // User IDs who signed NDA
}

// Enforce NDA before granting access
async function grantClientProjectAccess(
  projectId: string,
  userId: string
) {
  const clientProject = await clientProjectRepo.findOne({ projectId });
  
  // Check if NDA required
  if (clientProject.nda_required) {
    const hasSignedNDA = clientProject.nda_signed_by.includes(userId);
    
    if (!hasSignedNDA) {
      throw new BusinessRuleException(
        'NDA signature required before accessing this project'
      );
    }
  }
  
  // Grant access
  await grantProjectAccess(projectId, userId, 'MEMBER', systemUser);
}
```

---

## 3. Document Security

### 3.1 Document Encryption

```typescript
// All project documents encrypted at rest
interface ProjectDocument {
  id: string;
  projectId: string;
  filename: string;
  encryptedContent: Buffer;   // AES-256 encrypted
  encryptionKey: string;       // Stored in Vault
  contentHash: string;         // SHA-256 for integrity
  version: number;
  uploadedBy: string;
  uploadedAt: Date;
  confidentialityLevel: string;
}

// Upload document with encryption
async function uploadDocument(
  projectId: string,
  file: Buffer,
  metadata: DocumentMetadata
) {
  // Generate encryption key
  const encryptionKey = await generateKey();
  
  // Encrypt file content
  const encrypted = await encrypt(file, encryptionKey);
  
  // Calculate content hash
  const hash = sha256(file);
  
  // Store encrypted document
  const doc = await documentRepo.save({
    projectId,
    filename: metadata.filename,
    encryptedContent: encrypted,
    contentHash: hash,
    uploadedBy: metadata.userId,
    uploadedAt: new Date()
  });
  
  // Store encryption key in Vault
  await vault.write(`project-docs/${doc.id}/key`, {
    key: encryptionKey
  });
  
  return doc;
}

// Download document (audit logged)
async function downloadDocument(documentId: string, user: User): Promise<Buffer> {
  const doc = await documentRepo.findOne({ id: documentId });
  
  // Check access
  if (!await canAccessProject(user, doc.projectId)) {
    throw new ForbiddenException('Access denied');
  }
  
  // Retrieve encryption key
  const { key } = await vault.read(`project-docs/${documentId}/key`);
  
  // Decrypt
  const decrypted = await decrypt(doc.encryptedContent, key);
  
  // Verify integrity
  const hash = sha256(decrypted);
  if (hash !== doc.contentHash) {
    throw new SecurityException('Document integrity check failed');
  }
  
  // Audit log
  await auditLog({
    action: 'DOCUMENT_DOWNLOADED',
    document_id: documentId,
    project_id: doc.projectId,
    user_id: user.id
  });
  
  return decrypted;
}
```

### 3.2 Document Watermarking

```typescript
// Optional watermarking for sensitive documents
async function watermarkDocument(
  documentBuffer: Buffer,
  user: User,
  projectId: string
): Promise<Buffer> {
  const watermark = {
    text: `CONFIDENTIAL - ${user.email} - ${new Date().toISOString()}`,
    position: 'diagonal',
    opacity: 0.2,
    projectId
  };
  
  return await pdfWatermark.add(documentBuffer, watermark);
}
```

---

## 4. Client Confidentiality

### 4.1 Client Data Compartmentalization

```typescript
// Strict separation of client data
const clientCompartments = {
  // Users can only see projects for clients they're assigned to
  filterByClient: async (user: User) => {
    const authorizedClients = await getAuthorizedClients(user.id);
    
    return await projectRepo.find({
      where: {
        client_id: In(authorizedClients),
        company_id: user.company_id
      }
    });
  },
  
  // Cross-client data leakage prevention
  preventCrossClientAccess: (projectA: Project, projectB: Project) => {
    return projectA.client_id === projectB.client_id;
  }
};
```

### 4.2 NDA Management

```typescript
interface NDA {
  id: string;
  userId: string;
  clientId: string;
  signedAt: Date;
  expiresAt?: Date;
  documentUrl: string;  // Signed PDF
  ipSignature: string;
  digitalSignature: string;
}

// Record NDA signature
async function signNDA(userId: string, clientId: string, signature: string) {
  const nda = await ndaRepo.save({
    userId,
    clientId,
    signedAt: new Date(),
    ipSignature: request.ip,
    digitalSignature: signature
  });
  
  // Grant access to client projects
  const clientProjects = await projectRepo.find({ client_id: clientId });
  for (const project of clientProjects) {
    await grantProjectAccess(project.id, userId, 'MEMBER', systemUser);
  }
  
  return nda;
}
```

---

## 5. Time Tracking Security

### 5.1 Time Entry Validation

```typescript
// Prevent time tracking fraud
async function validateTimeEntry(entry: TimeEntry): Promise<void> {
  // Check 1: No overlapping entries
  const overlapping = await timeEntryRepo.findOne({
    where: {
      user_id: entry.user_id,
      date: entry.date,
      start_time: LessThan(entry.end_time),
      end_time: MoreThan(entry.start_time)
    }
  });
  
  if (overlapping) {
    throw new BusinessRuleException('Overlapping time entries detected');
  }
  
  // Check 2: Reasonable hours (max 16 hours/day)
  const duration = (entry.end_time - entry.start_time) / (1000 * 60 * 60);
  if (duration > 16) {
    throw new BusinessRuleException('Time entry exceeds 16 hours');
  }
  
  // Check 3: GPS verification (if enabled)
  if (entry.gps_required) {
    const isAtProjectLocation = await verifyGPSLocation(
      entry.gps_coordinates,
      entry.project_location
    );
    
    if (!isAtProjectLocation) {
      throw new BusinessRuleException('GPS location verification failed');
    }
  }
}
```

### 5.2 Time Entry Audit Trail

```typescript
// Immutable time entry logs for billing
interface TimeEntryAudit {
  id: string;
  time_entry_id: string;
  action: 'CREATED' | 'UPDATED' | 'DELETED' | 'APPROVED' | 'REJECTED';
  user_id: string;
  before_state: object;
  after_state: object;
  timestamp: Date;
  ip_address: string;
  approved_by?: string;
}

// All changes to billable time are logged
async function updateTimeEntry(entryId: string, updates: Partial<TimeEntry>) {
  const entry = await timeEntryRepo.findOne({ id: entryId });
  
  await timeEntryAuditRepo.save({
    time_entry_id: entryId,
    action: 'UPDATED',
    user_id: entry.user_id,
    before_state: entry,
    after_state: { ...entry, ...updates },
    timestamp: new Date(),
    ip_address: request.ip
  });
  
  await timeEntryRepo.update({ id: entryId }, updates);
}
```

---

## 6. Audit & Compliance

### 6.1 Project Access Audit

```sql
-- Who has accessed which projects (last 30 days)
SELECT
  p.name as project_name,
  p.client_name,
  u.email as user_email,
  COUNT(al.id) as access_count,
  MAX(al.created_at) as last_access,
  string_agg(DISTINCT al.action, ', ') as actions
FROM audit_logs al
JOIN projects p ON al.project_id = p.id
JOIN users u ON al.user_id = u.id
WHERE al.created_at >= NOW() - INTERVAL '30 days'
  AND al.entity = 'project'
GROUP BY p.id, p.name, p.client_name, u.email
ORDER BY access_count DESC;
```

### 6.2 Security Checklist

**Project Access:**
- [ ] Project-level ACL configured
- [ ] Client compartmentalization enforced
- [ ] NDA tracking implemented
- [ ] Time-based access expiry working

**Document Security:**
- [ ] All documents encrypted at rest
- [ ] Encryption keys in Vault
- [ ] Document integrity checks active
- [ ] Watermarking configured (if needed)

**Time Tracking:**
- [ ] Overlapping entry prevention active
- [ ] GPS verification configured (if needed)
- [ ] Time entry audit trail immutable
- [ ] Manager approval workflow active

**Audit & Compliance:**
- [ ] All project accesses logged
- [ ] Document downloads tracked
- [ ] Quarterly access reviews scheduled
- [ ] Client confidentiality verified

---

**Related Documentation:**
- [SECURITY_OVERVIEW.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/security/SECURITY_OVERVIEW.md)
- [PROJECTS_API.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/api/PROJECTS_API.md)
- [MODULE_PROJECTS.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/modules/MODULE_PROJECTS.md)

**Last Updated:** February 2026  
**Maintained by:** Security Team
