# BLIH Core Integration Patterns

## Table of Contents
1. [Integration Overview](#integration-overview)
2. [Integration Types](#integration-types)
3. [Authentication & Authorization](#authentication--authorization)
4. [Event-Driven Integration](#event-driven-integration)
5. [API Integration Patterns](#api-integration-patterns)
6. [Database Integration](#database-integration)
7. [Third-Party Integrations](#third-party-integrations)
8. [Integration Security](#integration-security)
9. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
10. [Best Practices](#best-practices)

---

## Integration Overview

### Integration Philosophy
BLIH Core Platform follows a **composable integration approach** with:
- **Event-driven architecture** for loose coupling
- **API-first design** for synchronous operations
- **Secure by default** with comprehensive authentication
- **Backward compatibility** for version management
- **Observability** for all integration points

### Integration Categories
| Category | Purpose | Protocol | Use Cases |
|----------|---------|----------|-----------|
| **Internal** | Module-to-module communication | Events, REST API | HR → Finance, CRM → Projects |
| **External** | Third-party system integration | REST API, Webhooks, SFTP | Payroll, Email, SMS |
| **Data Sync** | Bidirectional data synchronization | Events, Scheduled Jobs | HRIS, Accounting |
| **Analytics** | Business intelligence & reporting | Export APIs, Data Lake | Power BI, Tableau |

---

## Integration Types

### 1. Event-Driven Integration

**Architecture:**
```
┌─────────────┐    Event     ┌─────────────┐    Event     ┌─────────────┐
│   Source    │──────────────▶│   Core      │──────────────▶│  Target     │
│   Module    │               │  Platform   │               │   System    │
└─────────────┘               └─────────────┘               └─────────────┘
       │                             │                             │
       ▼                             ▼                             ▼
┌─────────────┐               ┌─────────────┐               ┌─────────────┐
│   Event     │               │   Event     │               │   Event     │
│   Publisher │               │   Broker    │               │  Consumer   │
└─────────────┘               └─────────────┘               └─────────────┘
```

**Event Types:**
```javascript
// Employee Events
{
  "eventType": "hr.employee.created",
  "eventId": "evt_123456789",
  "timestamp": "2026-02-10T11:57:00Z",
  "source": "hr-module",
  "data": {
    "employeeId": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "department": "IT",
    "position": "Software Engineer"
  },
  "metadata": {
    "version": "1.0",
    "correlationId": "corr_123456789",
    "userId": "admin"
  }
}

// Financial Events
{
  "eventType": "finance.invoice.created",
  "eventId": "evt_123456790",
  "timestamp": "2026-02-10T11:57:00Z",
  "source": "finance-module",
  "data": {
    "invoiceId": "INV001",
    "customerId": "CUST001",
    "amount": 15000.00,
    "currency": "ETB",
    "dueDate": "2026-03-10"
  }
}
```

### 2. REST API Integration

**Authentication Flow:**
```
┌─────────────┐    1. Login    ┌─────────────┐    2. Token     ┌─────────────┐
│   Client    │──────────────▶│   Keycloak  │◀───────────────│   Client    │
│ Application │               │             │               │ Application │
└─────────────┘               └─────────────┘               └─────────────┘
       │                             │                             │
       │ 3. Access Token              │ 4. API Request              │
       ▼                             ▼                             ▼
┌─────────────┐    API Call   ┌─────────────┐    Response    ┌─────────────┐
│   Client    │──────────────▶│   BLIH      │◀───────────────│   Client    │
│ Application │               │   Core API  │               │ Application │
└─────────────┘               └─────────────┘               └─────────────┘
```

**API Request Example:**
```javascript
// Authentication
POST /api/v1/auth/login
{
  "email": "user@company.com",
  "password": "securePassword",
  "mfaToken": "123456"
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": "user_123",
    "email": "user@company.com",
    "roles": ["EMPLOYEE"]
  }
}

// API Call with Token
GET /api/v1/employees/EMP001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Authentication & Authorization

### JWT Token Structure
```javascript
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "sub": "user_123",
  "email": "user@company.com",
  "roles": ["EMPLOYEE", "HR_VIEWER"],
  "permissions": [
    "hr:employee:view",
    "hr:attendance:view"
  ],
  "company": "BLIH",
  "iat": 1676036200,
  "exp": 1676037100
}

// Signature
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

### OAuth 2.0 Flow
```javascript
// Authorization Code Flow
1. GET /oauth/authorize?
   response_type=code&
   client_id=your_client_id&
   redirect_uri=https://yourapp.com/callback&
   scope=hr:employee:read hr:attendance:read&
   state=random_string

2. User authenticates and authorizes

3. Redirect to: https://yourapp.com/callback?
   code=auth_code&
   state=random_string

4. POST /oauth/token
{
  "grant_type": "authorization_code",
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "code": "auth_code",
  "redirect_uri": "https://yourapp.com/callback"
}

5. Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### API Key Authentication
```javascript
// API Key Generation
POST /api/v1/integrations/api-keys
{
  "name": "Payroll Integration",
  "permissions": [
    "hr:employee:read",
    "hr:attendance:read",
    "finance:salary:read"
  ],
  "expiresAt": "2026-12-31T23:59:59Z"
}

// Response
{
  "apiKey": "bl_live_51f2a8b9c3d7e6f4a1b2c3d4e5f6a7b8",
  "keyId": "key_123456789",
  "createdAt": "2026-02-10T11:57:00Z",
  "expiresAt": "2026-12-31T23:59:59Z"
}

// Using API Key
GET /api/v1/employees
X-API-Key: bl_live_51f2a8b9c3d7e6f4a1b2c3d4e5f6a7b8
```

---

## Event-Driven Integration

### Event Publishing Pattern
```javascript
// Publisher Implementation
class EventPublisher {
  constructor(rabbitmqClient) {
    this.client = rabbitmqClient;
    this.exchange = 'blih.events';
  }

  async publish(eventType, data, metadata = {}) {
    const event = {
      eventType,
      eventId: this.generateEventId(),
      timestamp: new Date().toISOString(),
      source: metadata.source || 'unknown',
      data,
      metadata: {
        version: '1.0',
        correlationId: metadata.correlationId || this.generateCorrelationId(),
        userId: metadata.userId,
        ...metadata
      }
    };

    await this.client.publish(this.exchange, '', Buffer.from(JSON.stringify(event)));
    return event;
  }

  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateCorrelationId() {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Usage
const publisher = new EventPublisher(rabbitmqClient);

await publisher.publish('hr.employee.created', {
  employeeId: 'EMP001',
  firstName: 'John',
  lastName: 'Doe'
}, {
  source: 'hr-module',
  userId: 'admin'
});
```

### Event Consumer Pattern
```javascript
// Consumer Implementation
class EventConsumer {
  constructor(rabbitmqClient) {
    this.client = rabbitmqClient;
    this.exchange = 'blih.events';
    this.handlers = new Map();
  }

  async subscribe(queueName, eventTypes, handler) {
    const channel = await this.client.createChannel();
    
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, this.exchange, '');
    
    eventTypes.forEach(eventType => {
      this.handlers.set(eventType, handler);
    });

    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const event = JSON.parse(msg.content.toString());
          const handler = this.handlers.get(event.eventType);
          
          if (handler) {
            await handler(event);
            channel.ack(msg);
          } else {
            console.warn(`No handler for event type: ${event.eventType}`);
            channel.nack(msg, false, false);
          }
        } catch (error) {
          console.error('Error processing event:', error);
          channel.nack(msg, false, true); // Requeue
        }
      }
    });
  }
}

// Usage
const consumer = new EventConsumer(rabbitmqClient);

await consumer.subscribe('finance-events', [
  'hr.employee.created',
  'hr.employee.updated',
  'hr.salary.changed'
], async (event) => {
  if (event.eventType === 'hr.employee.created') {
    await financeService.createEmployeeAccount(event.data);
  }
});
```

### Event Sourcing Pattern
```javascript
// Event Store Implementation
class EventStore {
  constructor(database) {
    this.db = database;
  }

  async saveEvent(aggregateId, event) {
    const eventRecord = {
      id: this.generateId(),
      aggregateId,
      eventType: event.eventType,
      eventData: event.data,
      eventMetadata: event.metadata,
      timestamp: event.timestamp,
      version: await this.getNextVersion(aggregateId)
    };

    await this.db.collection('events').insertOne(eventRecord);
    return eventRecord;
  }

  async getEvents(aggregateId, fromVersion = 0) {
    return await this.db.collection('events')
      .find({ aggregateId, version: { $gt: fromVersion } })
      .sort({ version: 1 })
      .toArray();
  }

  async replayAggregate(aggregateId, aggregateClass) {
    const events = await this.getEvents(aggregateId);
    const aggregate = new aggregateClass();
    
    for (const event of events) {
      aggregate.apply(event);
    }
    
    return aggregate;
  }

  generateId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getNextVersion(aggregateId) {
    const lastEvent = await this.db.collection('events')
      .findOne({ aggregateId }, { sort: { version: -1 } });
    return lastEvent ? lastEvent.version + 1 : 1;
  }
}
```

---

## API Integration Patterns

### 1. Synchronous API Pattern
```javascript
// API Client Implementation
class BLIHApiClient {
  constructor(baseURL, apiKey) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.axios = require('axios').create({
      baseURL,
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  async getEmployee(employeeId) {
    try {
      const response = await this.axios.get(`/api/v1/employees/${employeeId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(`Employee ${employeeId} not found`);
      }
      throw error;
    }
  }

  async createEmployee(employeeData) {
    const response = await this.axios.post('/api/v1/employees', employeeData);
    return response.data;
  }

  async updateEmployee(employeeId, updates) {
    const response = await this.axios.patch(`/api/v1/employees/${employeeId}`, updates);
    return response.data;
  }

  async getEmployees(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await this.axios.get(`/api/v1/employees?${params}`);
    return response.data;
  }
}

// Usage
const client = new BLIHApiClient('https://blih.company.com', 'your_api_key');

const employee = await client.getEmployee('EMP001');
const employees = await client.getEmployees({ department: 'IT', status: 'ACTIVE' });
```

### 2. Batch Processing Pattern
```javascript
// Batch Processor Implementation
class BatchProcessor {
  constructor(apiClient, batchSize = 100, concurrency = 5) {
    this.apiClient = apiClient;
    this.batchSize = batchSize;
    this.concurrency = concurrency;
  }

  async processBatch(items, processor) {
    const batches = this.createBatches(items, this.batchSize);
    const results = [];

    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(item => processor(item))
      );
      results.push(...batchResults);
    }

    return results;
  }

  async processEmployeesWithRetry(employees) {
    const results = [];
    const failed = [];

    for (const employee of employees) {
      try {
        const result = await this.apiClient.createEmployee(employee);
        results.push(result);
      } catch (error) {
        failed.push({ employee, error });
      }
    }

    return { results, failed };
  }

  createBatches(items, batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }
}

// Usage
const batchProcessor = new BatchProcessor(client, 50, 3);

const employees = [
  { firstName: 'John', lastName: 'Doe', department: 'IT' },
  { firstName: 'Jane', lastName: 'Smith', department: 'HR' },
  // ... more employees
];

const { results, failed } = await batchProcessor.processEmployeesWithRetry(employees);
```

### 3. Webhook Pattern
```javascript
// Webhook Handler Implementation
class WebhookHandler {
  constructor(secret, eventHandlers) {
    this.secret = secret;
    this.eventHandlers = eventHandlers;
  }

  handleWebhook(req, res) {
    try {
      // Verify signature
      const signature = req.headers['x-blih-signature'];
      if (!this.verifySignature(req.body, signature)) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // Process event
      const event = req.body;
      const handler = this.eventHandlers[event.eventType];

      if (handler) {
        handler(event);
        res.status(200).json({ received: true });
      } else {
        res.status(400).json({ error: 'Unknown event type' });
      }
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  verifySignature(payload, signature) {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return `sha256=${expectedSignature}` === signature;
  }
}

// Usage
const webhookHandler = new WebhookHandler('your_webhook_secret', {
  'employee.created': (event) => {
    console.log('New employee created:', event.data);
    // Process new employee
  },
  'employee.updated': (event) => {
    console.log('Employee updated:', event.data);
    // Update external system
  }
});

// Express.js endpoint
app.post('/webhook/blih', (req, res) => {
  webhookHandler.handleWebhook(req, res);
});
```

---

## Database Integration

### 1. Direct Database Integration
```javascript
// Database Connector Implementation
class BLIHDatabaseConnector {
  constructor(config) {
    this.config = config;
    this.pool = null;
  }

  async connect() {
    const { Pool } = require('pg');
    this.pool = new Pool({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
      ssl: this.config.ssl || false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async query(text, params = []) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getEmployees(filters = {}) {
    let query = 'SELECT * FROM employees WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.department) {
      query += ` AND department = $${paramIndex++}`;
      params.push(filters.department);
    }

    if (filters.status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(filters.status);
    }

    return await this.query(query, params);
  }

  async createEmployee(employeeData) {
    const fields = Object.keys(employeeData).join(', ');
    const placeholders = Object.keys(employeeData)
      .map((_, index) => `$${index + 1}`)
      .join(', ');
    const values = Object.values(employeeData);

    const query = `
      INSERT INTO employees (${fields})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.query(query, values);
    return result[0];
  }

  async close() {
    await this.pool.end();
  }
}

// Usage
const dbConnector = new BLIHDatabaseConnector({
  host: 'localhost',
  port: 5432,
  database: 'blih_core',
  user: 'blih_user',
  password: 'secure_password'
});

await dbConnector.connect();

const employees = await dbConnector.getEmployees({ department: 'IT' });
const newEmployee = await dbConnector.createEmployee({
  firstName: 'John',
  lastName: 'Doe',
  department: 'IT',
  position: 'Software Engineer'
});

await dbConnector.close();
```

### 2. Change Data Capture (CDC) Pattern
```javascript
// CDC Implementation
class CDCListener {
  constructor(databaseConnector, eventPublisher) {
    this.dbConnector = databaseConnector;
    this.eventPublisher = eventPublisher;
    this.lastProcessedId = 0;
  }

  async start() {
    setInterval(async () => {
      await this.processChanges();
    }, 5000); // Check every 5 seconds
  }

  async processChanges() {
    const changes = await this.getChanges(this.lastProcessedId);
    
    for (const change of changes) {
      await this.publishChangeEvent(change);
      this.lastProcessedId = change.id;
    }
  }

  async getChanges(lastId) {
    const query = `
      SELECT * FROM audit_logs 
      WHERE id > $1 
      ORDER BY id ASC 
      LIMIT 100
    `;
    
    return await this.dbConnector.query(query, [lastId]);
  }

  async publishChangeEvent(change) {
    const event = {
      eventType: this.mapOperationToEvent(change.operation),
      data: change.new_data,
      metadata: {
        table: change.table_name,
        operation: change.operation,
        userId: change.user_id,
        timestamp: change.timestamp
      }
    };

    await this.eventPublisher.publish(event.eventType, event.data, event.metadata);
  }

  mapOperationToEvent(operation) {
    const mapping = {
      'INSERT': 'record.created',
      'UPDATE': 'record.updated',
      'DELETE': 'record.deleted'
    };
    return mapping[operation] || 'record.changed';
  }
}

// Usage
const cdcListener = new CDCListener(dbConnector, eventPublisher);
await cdcListener.start();
```

---

## Third-Party Integrations

### 1. Payroll System Integration
```javascript
// Payroll Integration
class PayrollIntegration {
  constructor(blihClient, payrollClient) {
    this.blihClient = blihClient;
    this.payrollClient = payrollClient;
  }

  async syncEmployees() {
    // Get employees from BLIH
    const blihEmployees = await this.blihClient.getEmployees({
      status: 'ACTIVE'
    });

    // Get employees from payroll system
    const payrollEmployees = await this.payrollClient.getEmployees();

    // Compare and sync
    const updates = [];
    const newEmployees = [];

    for (const blihEmp of blihEmployees) {
      const payrollEmp = payrollEmployees.find(p => p.employeeId === blihEmp.employeeId);
      
      if (!payrollEmp) {
        newEmployees.push(this.mapToPayrollFormat(blihEmp));
      } else if (this.hasChanges(blihEmp, payrollEmp)) {
        updates.push(this.mapToPayrollFormat(blihEmp));
      }
    }

    // Send updates to payroll
    if (newEmployees.length > 0) {
      await this.payrollClient.createEmployees(newEmployees);
    }

    if (updates.length > 0) {
      await this.payrollClient.updateEmployees(updates);
    }

    return { newEmployees: newEmployees.length, updates: updates.length };
  }

  mapToPayrollFormat(blihEmployee) {
    return {
      employeeId: blihEmployee.employeeId,
      firstName: blihEmployee.firstName,
      lastName: blihEmployee.lastName,
      email: blihEmployee.email,
      department: blihEmployee.department,
      position: blihEmployee.position,
      salary: blihEmployee.salary,
      bankAccount: blihEmployee.bankAccount,
      taxId: blihEmployee.taxId
    };
  }

  hasChanges(blihEmp, payrollEmp) {
    return blihEmp.firstName !== payrollEmp.firstName ||
           blihEmp.lastName !== payrollEmp.lastName ||
           blihEmp.email !== payrollEmp.email ||
           blihEmp.department !== payrollEmp.department ||
           blihEmp.position !== payrollEmp.position ||
           blihEmp.salary !== payrollEmp.salary;
  }
}
```

### 2. Email Service Integration
```javascript
// Email Integration
class EmailIntegration {
  constructor(smtpConfig, templateEngine) {
    this.smtpConfig = smtpConfig;
    this.templateEngine = templateEngine;
  }

  async sendEmail(to, subject, templateName, data) {
    const nodemailer = require('nodemailer');
    
    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: this.smtpConfig.host,
      port: this.smtpConfig.port,
      secure: this.smtpConfig.secure,
      auth: {
        user: this.smtpConfig.user,
        pass: this.smtpConfig.password
      }
    });

    // Render template
    const html = await this.templateEngine.render(templateName, data);

    // Send email
    const info = await transporter.sendMail({
      from: this.smtpConfig.from,
      to,
      subject,
      html
    });

    return info;
  }

  async sendWelcomeEmail(employee) {
    await this.sendEmail(
      employee.email,
      'Welcome to BLIH!',
      'welcome-email',
      {
        firstName: employee.firstName,
        lastName: employee.lastName,
        department: employee.department,
        position: employee.position
      }
    );
  }

  async sendLeaveNotification(employee, leaveRequest) {
    await this.sendEmail(
      employee.managerEmail,
      `Leave Request: ${employee.firstName} ${employee.lastName}`,
      'leave-notification',
      {
        employee: employee,
        leaveRequest: leaveRequest
      }
    );
  }
}
```

### 3. SMS Service Integration
```javascript
// SMS Integration
class SMSIntegration {
  constructor(smsProvider) {
    this.smsProvider = smsProvider;
  }

  async sendSMS(to, message) {
    try {
      const result = await this.smsProvider.send({
        to,
        message,
        from: 'BLIH'
      });
      return result;
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw error;
    }
  }

  async sendOTP(phoneNumber, otp) {
    const message = `Your BLIH verification code is: ${otp}. Valid for 5 minutes.`;
    return await this.sendSMS(phoneNumber, message);
  }

  async sendAlert(phoneNumber, alertMessage) {
    const message = `[BLIH ALERT] ${alertMessage}`;
    return await this.sendSMS(phoneNumber, message);
  }
}
```

---

## Integration Security

### 1. API Security
```javascript
// API Security Middleware
class APISecurityMiddleware {
  constructor(options = {}) {
    this.rateLimitWindow = options.rateLimitWindow || 15 * 60 * 1000; // 15 minutes
    this.rateLimitMax = options.rateLimitMax || 100;
    this.rateLimitStore = new Map();
  }

  rateLimit() {
    return (req, res, next) => {
      const key = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const windowStart = now - this.rateLimitWindow;

      // Clean old entries
      if (this.rateLimitStore.has(key)) {
        const requests = this.rateLimitStore.get(key).filter(time => time > windowStart);
        this.rateLimitStore.set(key, requests);
      } else {
        this.rateLimitStore.set(key, []);
      }

      // Check limit
      const requests = this.rateLimitStore.get(key);
      if (requests.length >= this.rateLimitMax) {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil(this.rateLimitWindow / 1000)
        });
      }

      // Add current request
      requests.push(now);
      next();
    };
  }

  validateApiKey() {
    return async (req, res, next) => {
      const apiKey = req.headers['x-api-key'];
      
      if (!apiKey) {
        return res.status(401).json({ error: 'API key required' });
      }

      try {
        const keyData = await this.validateApiKeyInDB(apiKey);
        if (!keyData) {
          return res.status(401).json({ error: 'Invalid API key' });
        }

        req.apiKey = keyData;
        next();
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }

  async validateApiKeyInDB(apiKey) {
    // Database validation logic
    // Returns key data if valid, null otherwise
  }
}
```

### 2. Data Encryption
```javascript
// Data Encryption Utilities
class DataEncryption {
  constructor(secretKey) {
    this.algorithm = 'aes-256-gcm';
    this.secretKey = crypto.scryptSync(secretKey, 'salt', 32);
  }

  encrypt(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.secretKey);
    cipher.setAAD(Buffer.from('blih-data', 'utf8'));
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedData) {
    const decipher = crypto.createDecipher(this.algorithm, this.secretKey);
    decipher.setAAD(Buffer.from('blih-data', 'utf8'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return { salt, hash };
  }

  verifyPassword(password, salt, hash) {
    const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
  }
}
```

---

## Monitoring & Troubleshooting

### 1. Integration Monitoring
```javascript
// Integration Monitor
class IntegrationMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      lastError: null
    };
  }

  trackRequest(startTime, success = true, error = null) {
    const responseTime = Date.now() - startTime;
    
    this.metrics.requests++;
    this.metrics.responseTime.push(responseTime);
    
    if (!success) {
      this.metrics.errors++;
      this.metrics.lastError = {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack
      };
    }

    // Keep only last 100 response times
    if (this.metrics.responseTime.length > 100) {
      this.metrics.responseTime.shift();
    }
  }

  getMetrics() {
    const avgResponseTime = this.metrics.responseTime.length > 0
      ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length
      : 0;

    const errorRate = this.metrics.requests > 0
      ? (this.metrics.errors / this.metrics.requests) * 100
      : 0;

    return {
      totalRequests: this.metrics.requests,
      totalErrors: this.metrics.errors,
      errorRate: errorRate.toFixed(2) + '%',
      averageResponseTime: Math.round(avgResponseTime) + 'ms',
      lastError: this.metrics.lastError
    };
  }

  reset() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      lastError: null
    };
  }
}
```

### 2. Error Handling & Retry Logic
```javascript
// Retry Handler
class RetryHandler {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.backoffMultiplier = options.backoffMultiplier || 2;
  }

  async executeWithRetry(operation, context = {}) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt === this.maxRetries) {
          throw new Error(`Operation failed after ${this.maxRetries + 1} attempts: ${error.message}`);
        }

        const delay = this.retryDelay * Math.pow(this.backoffMultiplier, attempt);
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error.message);
        
        await this.sleep(delay);
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage
const retryHandler = new RetryHandler({
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2
});

const result = await retryHandler.executeWithRetry(async () => {
  return await apiClient.getEmployee('EMP001');
});
```

---

## Best Practices

### 1. Integration Design Principles

**1. Loose Coupling**
- Use events for asynchronous communication
- Avoid direct database access between modules
- Implement versioned APIs

**2. Fault Tolerance**
- Implement retry logic with exponential backoff
- Use circuit breakers for external services
- Provide fallback mechanisms

**3. Security First**
- Always authenticate and authorize
- Encrypt sensitive data in transit and at rest
- Use API keys with limited scope and expiration

**4. Observability**
- Log all integration events
- Monitor performance metrics
- Implement health checks

### 2. Performance Optimization

**1. Caching Strategy**
```javascript
// Cache Implementation
class IntegrationCache {
  constructor(redisClient) {
    this.redis = redisClient;
    this.defaultTTL = 3600; // 1 hour
  }

  async get(key) {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key, value, ttl = this.defaultTTL) {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern) {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

**2. Batch Processing**
- Process multiple items in single requests
- Use bulk operations for database writes
- Implement parallel processing where possible

**3. Connection Pooling**
- Reuse database connections
- Implement HTTP connection pooling
- Configure appropriate pool sizes

### 3. Error Handling Guidelines

**1. Error Classification**
```javascript
// Error Types
class IntegrationError extends Error {
  constructor(message, code, retryable = false) {
    super(message);
    this.name = 'IntegrationError';
    this.code = code;
    this.retryable = retryable;
  }
}

class ValidationError extends IntegrationError {
  constructor(message) {
    super(message, 'VALIDATION_ERROR', false);
  }
}

class NetworkError extends IntegrationError {
  constructor(message) {
    super(message, 'NETWORK_ERROR', true);
  }
}

class AuthenticationError extends IntegrationError {
  constructor(message) {
    super(message, 'AUTH_ERROR', false);
  }
}
```

**2. Error Recovery**
- Implement automatic retry for transient errors
- Provide manual retry options for persistent errors
- Log detailed error information for debugging

### 4. Testing Strategies

**1. Unit Testing**
```javascript
// Example Unit Test
describe('BLIH API Client', () => {
  let apiClient;
  let mockAxios;

  beforeEach(() => {
    mockAxios = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn()
    };
    apiClient = new BLIHApiClient('https://test.com', 'test_key');
    apiClient.axios = mockAxios;
  });

  test('should get employee successfully', async () => {
    const mockEmployee = { id: 'EMP001', name: 'John Doe' };
    mockAxios.get.mockResolvedValue({ data: mockEmployee });

    const result = await apiClient.getEmployee('EMP001');
    
    expect(result).toEqual(mockEmployee);
    expect(mockAxios.get).toHaveBeenCalledWith('/api/v1/employees/EMP001');
  });

  test('should handle employee not found', async () => {
    mockAxios.get.mockRejectedValue({ response: { status: 404 } });

    await expect(apiClient.getEmployee('EMP001'))
      .rejects.toThrow('Employee EMP001 not found');
  });
});
```

**2. Integration Testing**
- Test with real API endpoints
- Use test environments with test data
- Verify end-to-end workflows

**3. Contract Testing**
- Define API contracts
- Verify compliance with contracts
- Test backward compatibility

---

*Documentation Version: 1.0*  
*Last Updated: February 2026*
