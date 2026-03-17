# HR Shared Services System Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Business Logic & Workflows](#business-logic--workflows)
6. [Integration Points](#integration-points)
7. [Security & Permissions](#security--permissions)
8. [Implementation Guidelines](#implementation-guidelines)
9. [Testing Procedures](#testing-procedures)
10. [Deployment Instructions](#deployment-instructions)
11. [Troubleshooting Guide](#troubleshooting-guide)

---

## System Overview

The HR Shared Services System provides foundational infrastructure services that support all HR subsystems. This system handles multi-channel notifications, workflow orchestration, report generation, and integration middleware while ensuring reliable communication, consistent data processing, and seamless system interoperability.

### Key Features

- **Notification Service:** Multi-channel delivery with templates and personalization
- **Workflow Engine:** Configurable approval chains and business process automation
- **Report Generation:** Dynamic report creation with scheduling and distribution
- **Integration Middleware:** External system connectivity with retry and error handling
- **Event Bus:** Event-driven architecture for real-time system communication

### Business Objectives

- Achieve 99.9%+ notification delivery reliability
- Process 1000+ workflow instances daily with <1% failure rate
- Generate 500+ reports monthly with <5 second average processing time
- Maintain 99.5%+ integration uptime with automatic failover

---

## Architecture

### System Components

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Admin Dashboard]
        B[Notification Center]
        C[Workflow Monitor]
        D[Report Builder]
    end

    subgraph "API Layer"
        E[Notification API]
        F[Workflow API]
        G[Report API]
        H[Integration API]
    end

    subgraph "Service Layer"
        I[Notification Service]
        J[Workflow Service]
        K[Report Service]
        L[Integration Service]
        M[Event Bus Service]
    end

    subgraph "Processing Layer"
        N[Template Engine]
        O[Workflow Engine]
        P[Report Generator]
        Q[Integration Router]
    end

    subgraph "Delivery Layer"
        R[Email Gateway]
        S[SMS Gateway]
        T[Push Notification]
        U[Webhook Delivery]
    end

    subgraph "Data Layer"
        V[PostgreSQL Database]
        W[Redis Cache]
        X[File Storage]
    end

    subgraph "External Services"
        Y[Email Service]
        Z[SMS Provider]
        AA[Push Service]
        BB[External APIs]
    end

    A --> E
    B --> F
    C --> G
    D --> H
    E --> I
    F --> J
    G --> K
    H --> L
    I --> N
    J --> O
    K --> P
    L --> Q
    M --> V
    N --> R
    O --> S
    P --> T
    Q --> U
    R --> Y
    S --> Z
    T --> AA
    U --> BB
```

### Component Responsibilities

| Component            | Responsibility                 | Key Technologies                  |
| -------------------- | ------------------------------ | --------------------------------- |
| Notification Service | Multi-channel message delivery | Template Engine, Queue Management |
| Workflow Service     | Business process automation    | State Machine, Approval Chains    |
| Report Service       | Dynamic report generation      | Data Aggregation, PDF Generation  |
| Integration Service  | External system connectivity   | REST APIs, Webhooks, Retry Logic  |
| Event Bus Service    | Real-time event distribution   | Message Queue, Event Sourcing     |

---

## Database Schema

### Core Tables

#### NotificationTemplate

```sql
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Template details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,

    -- Template content
    subject_template TEXT,
    body_template TEXT NOT NULL,
    html_template TEXT,
    variables JSONB,

    -- Delivery settings
    channels TEXT[] DEFAULT '{EMAIL}',
    priority VARCHAR(50) DEFAULT 'NORMAL',
    ttl INTEGER DEFAULT 86400,

    -- Personalization
    personalization_rules JSONB,
    conditional_content JSONB,

    -- Localization
    language VARCHAR(10) DEFAULT 'en',
    translations JSONB,

    -- Status and lifecycle
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,

    -- Analytics
    usage_count INTEGER DEFAULT 0,
    success_rate FLOAT DEFAULT 0,
    average_delivery_time INTEGER,

    -- Metadata
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notification_templates_category ON notification_templates(category, is_active);
CREATE INDEX idx_notification_templates_type ON notification_templates(type, is_active);
CREATE INDEX idx_notification_templates_usage ON notification_templates(usage_count DESC);
```

#### NotificationMessage

```sql
CREATE TABLE notification_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Message details
    template_id UUID REFERENCES notification_templates(id),
    recipient_id UUID REFERENCES users(id),
    recipient_type VARCHAR(50) NOT NULL,

    -- Content
    subject VARCHAR(255),
    body TEXT NOT NULL,
    html_body TEXT,
    variables JSONB,

    -- Delivery settings
    channels TEXT[] DEFAULT '{EMAIL}',
    priority VARCHAR(50) DEFAULT 'NORMAL',
    scheduled_at TIMESTAMP,
    expires_at TIMESTAMP,

    -- Status tracking
    status VARCHAR(50) DEFAULT 'PENDING',
    delivery_attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,

    -- Error handling
    error_message TEXT,
    error_code VARCHAR(50),
    retry_after TIMESTAMP,

    -- Analytics
    sent_via TEXT[],
    delivery_times JSONB,
    engagement_metrics JSONB,

    -- Metadata
    correlation_id VARCHAR(255),
    source_system VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notification_messages_recipient ON notification_messages(recipient_id, status);
CREATE INDEX idx_notification_messages_status ON notification_messages(status, created_at);
CREATE INDEX idx_notification_messages_scheduled ON notification_messages(scheduled_at, status);
CREATE INDEX idx_notification_messages_correlation ON notification_messages(correlation_id);
```

#### WorkflowInstance

```sql
CREATE TABLE workflow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Workflow details
    workflow_definition_id UUID REFERENCES workflow_definitions(id),
    workflow_name VARCHAR(255) NOT NULL,
    workflow_type VARCHAR(50) NOT NULL,

    -- Context and data
    initiator_id UUID REFERENCES users(id),
    context_data JSONB,
    business_key VARCHAR(255),

    -- Status tracking
    status VARCHAR(50) DEFAULT 'INITIATED',
    current_step VARCHAR(255),
    completed_steps TEXT[],
    pending_steps TEXT[],

    -- Timeline
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT NOW(),
    estimated_completion TIMESTAMP,

    -- Participants
    participants JSONB,
    current_assignee_id UUID REFERENCES users(id),
    approval_chain JSONB,

    -- Results and outcomes
    outcome VARCHAR(50),
    decision VARCHAR(255),
    output_data JSONB,

    -- Error handling
    error_message TEXT,
    error_step VARCHAR(255),
    retry_count INTEGER DEFAULT 0,

    -- Analytics
    total_processing_time INTEGER,
    step_completion_times JSONB,
    bottlenecks TEXT[],

    -- Metadata
    correlation_id VARCHAR(255),
    source_system VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workflow_instances_status ON workflow_instances(status, started_at);
CREATE INDEX idx_workflow_instances_initiator ON workflow_instances(initiator_id, status);
CREATE INDEX idx_workflow_instances_business_key ON workflow_instances(business_key);
CREATE INDEX idx_workflow_instances_assignee ON workflow_instances(current_assignee_id, status);
```

#### WorkflowDefinition

```sql
CREATE TABLE workflow_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Definition details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    workflow_type VARCHAR(50) NOT NULL,

    -- Configuration
    steps JSONB NOT NULL,
    transitions JSONB,
    variables JSONB,
    timeout_rules JSONB,

    -- Approval settings
    approval_required BOOLEAN DEFAULT false,
    approval_levels JSONB,
    escalation_rules JSONB,

    -- Execution settings
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    parallel_steps_allowed BOOLEAN DEFAULT false,

    -- Monitoring and analytics
    success_metrics JSONB,
    alert_conditions JSONB,

    -- Status and lifecycle
    status VARCHAR(50) DEFAULT 'DRAFT',
    published_by UUID REFERENCES users(id),
    published_at TIMESTAMP,

    -- Metadata
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workflow_definitions_category ON workflow_definitions(category, is_active);
CREATE INDEX idx_workflow_definitions_type ON workflow_definitions(workflow_type, is_active);
CREATE INDEX idx_workflow_definitions_status ON workflow_definitions(status, created_at);
```

#### ReportDefinition

```sql
CREATE TABLE report_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Report details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    report_type VARCHAR(50) NOT NULL,

    -- Data sources
    data_sources JSONB NOT NULL,
    query TEXT,
    parameters JSONB,

    -- Formatting
    template_id UUID REFERENCES notification_templates(id),
    format VARCHAR(50) DEFAULT 'PDF',
    layout JSONB,
    styling JSONB,

    -- Scheduling
    schedule_type VARCHAR(50),
    schedule_config JSONB,
    timezone VARCHAR(50) DEFAULT 'UTC',

    -- Distribution
    recipients JSONB,
    distribution_channels TEXT[],
    retention_days INTEGER DEFAULT 365,

    -- Access control
    access_permissions JSONB,
    is_public BOOLEAN DEFAULT false,

    -- Status and lifecycle
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,

    -- Analytics
    execution_count INTEGER DEFAULT 0,
    average_execution_time INTEGER,
    last_executed_at TIMESTAMP,

    -- Metadata
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_report_definitions_category ON report_definitions(category, is_active);
CREATE INDEX idx_report_definitions_type ON report_definitions(report_type, is_active);
CREATE INDEX idx_report_definitions_schedule ON report_definitions(schedule_type, is_active);
```

#### ReportExecution

```sql
CREATE TABLE report_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Execution details
    report_definition_id UUID REFERENCES report_definitions(id),
    report_name VARCHAR(255) NOT NULL,
    execution_type VARCHAR(50) NOT NULL,

    -- Parameters and context
    parameters JSONB,
    context_data JSONB,
    requested_by UUID REFERENCES users(id),

    -- Status tracking
    status VARCHAR(50) DEFAULT 'PENDING',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    execution_time INTEGER,

    -- Results
    file_url VARCHAR(500),
    file_size INTEGER,
    record_count INTEGER,
    summary_data JSONB,

    -- Error handling
    error_message TEXT,
    error_code VARCHAR(50),
    retry_count INTEGER DEFAULT 0,

    -- Distribution
    distributed_to TEXT[],
    distribution_status JSONB,
    delivery_attempts INTEGER DEFAULT 0,

    -- Analytics
    data_processing_time INTEGER,
    generation_time INTEGER,
    distribution_time INTEGER,

    -- Metadata
    correlation_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_report_executions_definition ON report_executions(report_definition_id, status);
CREATE INDEX idx_report_executions_status ON report_executions(status, created_at);
CREATE INDEX idx_report_executions_requested ON report_executions(requested_by, created_at);
CREATE INDEX idx_report_executions_correlation ON report_executions(correlation_id);
```

#### IntegrationLog

```sql
CREATE TABLE integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Integration details
    integration_name VARCHAR(100) NOT NULL,
    system_name VARCHAR(100) NOT NULL,
    operation_type VARCHAR(50) NOT NULL,

    -- Request details
    request_method VARCHAR(10),
    request_url VARCHAR(500),
    request_headers JSONB,
    request_body TEXT,

    -- Response details
    response_status INTEGER,
    response_headers JSONB,
    response_body TEXT,
    response_time INTEGER,

    -- Status and outcome
    status VARCHAR(50) NOT NULL,
    success BOOLEAN DEFAULT false,
    error_message TEXT,
    error_code VARCHAR(50),

    -- Retry information
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP,
    max_retries INTEGER DEFAULT 3,

    -- Context
    correlation_id VARCHAR(255),
    user_id UUID REFERENCES users(id),
    business_key VARCHAR(255),

    -- Analytics
    processing_time INTEGER,
    data_size INTEGER,
    cache_hit BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_integration_logs_system ON integration_logs(system_name, created_at);
CREATE INDEX idx_integration_logs_status ON integration_logs(status, created_at);
CREATE INDEX idx_integration_logs_correlation ON integration_logs(correlation_id);
CREATE INDEX idx_integration_logs_operation ON integration_logs(operation_type, created_at);
```

### Entity Relationships

```mermaid
erDiagram
    NotificationTemplate ||--o{ NotificationMessage : "generates"
    NotificationMessage }o--|| User : "sent to"
    WorkflowDefinition ||--o{ WorkflowInstance : "instantiates"
    WorkflowInstance }o--|| User : "initiated by"
    WorkflowInstance }o--|| User : "assigned to"
    ReportDefinition ||--o{ ReportExecution : "executes"
    ReportExecution }o--|| User : "requested by"
    NotificationTemplate }o--|| ReportDefinition : "used by"
```

---

## API Endpoints

### Notification Endpoints

#### POST /api/hr/shared/notifications/send

Send notification immediately.

**Request Body:**

```json
{
  "templateId": "uuid",
  "recipientId": "uuid",
  "recipientType": "USER",
  "variables": {
    "firstName": "John",
    "courseName": "JavaScript Basics",
    "dueDate": "2026-03-15"
  },
  "channels": ["EMAIL", "SMS"],
  "priority": "HIGH",
  "scheduledAt": "2026-02-28T10:00:00Z",
  "correlationId": "course-reminder-123"
}
```

**Response:**

```json
{
  "id": "uuid",
  "status": "SENT",
  "messageId": "uuid",
  "channels": ["EMAIL", "SMS"],
  "deliveredAt": "2026-02-28T10:01:00Z",
  "deliveryTimes": {
    "EMAIL": 1200,
    "SMS": 800
  }
}
```

#### POST /api/hr/shared/notifications/batch

Send batch notifications.

#### GET /api/hr/shared/notifications/templates

List notification templates.

#### POST /api/hr/shared/notifications/templates

Create notification template.

#### GET /api/hr/shared/notifications/status/:id

Get notification delivery status.

### Workflow Endpoints

#### POST /api/hr/shared/workflows/start

Start workflow instance.

**Request Body:**

```json
{
  "workflowDefinitionId": "uuid",
  "initiatorId": "uuid",
  "contextData": {
    "employeeId": "uuid",
    "requestType": "LEAVE_REQUEST",
    "leaveType": "ANNUAL",
    "startDate": "2026-03-15",
    "endDate": "2026-03-19",
    "reason": "Family vacation"
  },
  "businessKey": "LEAVE-REQ-2026-001"
}
```

#### GET /api/hr/shared/workflows/instances

List workflow instances.

#### PUT /api/hr/shared/workflows/instances/:id/approve

Approve workflow step.

#### GET /api/hr/shared/workflows/instances/:id/status

Get workflow instance status.

### Report Endpoints

#### POST /api/hr/shared/reports/generate

Generate report immediately.

**Request Body:**

```json
{
  "reportDefinitionId": "uuid",
  "parameters": {
    "startDate": "2026-01-01",
    "endDate": "2026-01-31",
    "departmentId": "uuid",
    "includeInactive": false
  },
  "format": "PDF",
  "requestedBy": "uuid"
}
```

#### GET /api/hr/shared/reports/definitions

List report definitions.

#### POST /api/hr/shared/reports/definitions

Create report definition.

#### GET /api/hr/shared/reports/executions/:id/download

Download generated report.

### Integration Endpoints

#### POST /api/hr/shared/integrations/sync

Trigger integration synchronization.

#### GET /api/hr/shared/integrations/logs

Get integration logs.

#### GET /api/hr/shared/integrations/status

Get integration system status.

---

## Business Logic & Workflows

### Multi-Channel Notification Delivery

```typescript
interface NotificationDelivery {
  messageId: string;
  channels: string[];
  status: 'PENDING' | 'SENDING' | 'SENT' | 'FAILED';
  deliveryResults: ChannelDelivery[];
  fallbackUsed: boolean;
}

interface ChannelDelivery {
  channel: string;
  status: 'SUCCESS' | 'FAILED' | 'RETRY';
  sentAt: Date;
  deliveryTime: number;
  errorMessage?: string;
  retryCount: number;
}

@Injectable()
export class NotificationDeliveryService {
  async sendNotification(
    message: NotificationMessage,
  ): Promise<NotificationDelivery> {
    const delivery = new NotificationDelivery();
    delivery.messageId = message.id;
    delivery.channels = message.channels;
    delivery.status = 'SENDING';

    // Sort channels by priority
    const sortedChannels = this.sortChannelsByPriority(message.channels);

    for (const channel of sortedChannels) {
      try {
        const result = await this.sendToChannel(message, channel);
        delivery.deliveryResults.push(result);

        if (result.status === 'SUCCESS') {
          delivery.status = 'SENT';
          break; // Stop on first successful delivery
        }
      } catch (error) {
        delivery.deliveryResults.push({
          channel,
          status: 'FAILED',
          sentAt: new Date(),
          deliveryTime: 0,
          errorMessage: error.message,
          retryCount: 0,
        });
      }
    }

    // Use fallback if all primary channels failed
    if (delivery.status === 'SENDING' && message.channels.length > 1) {
      delivery.fallbackUsed = await this.useFallbackChannel(message, delivery);
    }

    // Update message status
    await this.updateMessageStatus(message.id, delivery);

    return delivery;
  }

  private async sendToChannel(
    message: NotificationMessage,
    channel: string,
  ): Promise<ChannelDelivery> {
    const startTime = Date.now();

    switch (channel) {
      case 'EMAIL':
        return await this.sendEmail(message);
      case 'SMS':
        return await this.sendSMS(message);
      case 'PUSH':
        return await this.sendPushNotification(message);
      case 'WEBHOOK':
        return await this.sendWebhook(message);
      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
  }

  private async sendEmail(
    message: NotificationMessage,
  ): Promise<ChannelDelivery> {
    const emailService = this.getEmailService();

    const emailData = {
      to: message.recipient.email,
      subject: message.subject,
      body: message.body,
      html: message.htmlBody,
      templateId: message.templateId,
      variables: message.variables,
    };

    try {
      const result = await emailService.send(emailData);

      return {
        channel: 'EMAIL',
        status: 'SUCCESS',
        sentAt: new Date(),
        deliveryTime: result.deliveryTime,
        messageId: result.messageId,
      };
    } catch (error) {
      return {
        channel: 'EMAIL',
        status: 'FAILED',
        sentAt: new Date(),
        deliveryTime: 0,
        errorMessage: error.message,
        retryCount: 0,
      };
    }
  }

  private async sendSMS(
    message: NotificationMessage,
  ): Promise<ChannelDelivery> {
    const smsService = this.getSMSService();

    const smsData = {
      to: message.recipient.phoneNumber,
      message: this.formatSMSMessage(message),
      templateId: message.templateId,
      variables: message.variables,
    };

    try {
      const result = await smsService.send(smsData);

      return {
        channel: 'SMS',
        status: 'SUCCESS',
        sentAt: new Date(),
        deliveryTime: result.deliveryTime,
        messageId: result.messageId,
      };
    } catch (error) {
      return {
        channel: 'SMS',
        status: 'FAILED',
        sentAt: new Date(),
        deliveryTime: 0,
        errorMessage: error.message,
        retryCount: 0,
      };
    }
  }

  private async useFallbackChannel(
    message: NotificationMessage,
    delivery: NotificationDelivery,
  ): Promise<boolean> {
    const fallbackChannels = this.getFallbackChannels(message.channels);

    for (const fallbackChannel of fallbackChannels) {
      try {
        const result = await this.sendToChannel(message, fallbackChannel);
        delivery.deliveryResults.push(result);

        if (result.status === 'SUCCESS') {
          delivery.status = 'SENT';
          return true;
        }
      } catch (error) {
        // Log fallback attempt failure
        this.logger.warn(
          `Fallback channel ${fallbackChannel} failed: ${error.message}`,
        );
      }
    }

    return false;
  }
}
```

### Workflow Engine Implementation

```typescript
interface WorkflowStep {
  id: string;
  name: string;
  type: 'APPROVAL' | 'AUTOMATED' | 'DECISION' | 'PARALLEL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  assigneeId?: string;
  data: any;
  startTime?: Date;
  endTime?: Date;
  timeout?: number;
}

@Injectable()
export class WorkflowEngine {
  async executeWorkflow(
    instance: WorkflowInstance,
  ): Promise<WorkflowExecutionResult> {
    const definition = await this.getWorkflowDefinition(
      instance.workflowDefinitionId,
    );
    const context = this.createExecutionContext(instance, definition);

    try {
      // Initialize workflow
      await this.initializeWorkflow(context);

      // Execute steps sequentially
      while (context.currentStepIndex < definition.steps.length) {
        const step = definition.steps[context.currentStepIndex];

        // Execute current step
        const stepResult = await this.executeStep(step, context);

        // Handle step outcome
        if (stepResult.status === 'COMPLETED') {
          context.completedSteps.push(step.id);
          context.currentStepIndex++;
        } else if (stepResult.status === 'FAILED') {
          await this.handleStepFailure(step, stepResult, context);
          break;
        } else if (stepResult.status === 'WAITING') {
          // Workflow is waiting for external action
          await this.saveWorkflowState(context);
          break;
        }
      }

      // Finalize workflow
      const result = await this.finalizeWorkflow(context);

      return result;
    } catch (error) {
      await this.handleWorkflowError(error, context);
      throw error;
    }
  }

  private async executeStep(
    step: WorkflowStepDefinition,
    context: WorkflowContext,
  ): Promise<StepResult> {
    switch (step.type) {
      case 'APPROVAL':
        return await this.executeApprovalStep(step, context);
      case 'AUTOMATED':
        return await this.executeAutomatedStep(step, context);
      case 'DECISION':
        return await this.executeDecisionStep(step, context);
      case 'PARALLEL':
        return await this.executeParallelStep(step, context);
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  private async executeApprovalStep(
    step: WorkflowStepDefinition,
    context: WorkflowContext,
  ): Promise<StepResult> {
    const approvalStep: WorkflowStep = {
      id: step.id,
      name: step.name,
      type: 'APPROVAL',
      status: 'PENDING',
      assigneeId: step.assigneeId || this.determineAssignee(step, context),
      data: step.data,
      startTime: new Date(),
      timeout: step.timeout,
    };

    // Create approval task
    await this.createApprovalTask(approvalStep, context);

    // Send notification to assignee
    await this.sendApprovalNotification(approvalStep, context);

    // Set timeout if specified
    if (approvalStep.timeout) {
      this.scheduleApprovalTimeout(approvalStep, context);
    }

    // Save step state
    context.currentStep = approvalStep;
    await this.saveWorkflowState(context);

    return {
      status: 'WAITING',
      stepId: step.id,
      message: `Approval task created for ${approvalStep.assigneeId}`,
    };
  }

  private async executeAutomatedStep(
    step: WorkflowStepDefinition,
    context: WorkflowContext,
  ): Promise<StepResult> {
    const automatedStep: WorkflowStep = {
      id: step.id,
      name: step.name,
      type: 'AUTOMATED',
      status: 'IN_PROGRESS',
      data: step.data,
      startTime: new Date(),
    };

    try {
      // Execute automated action
      const actionResult = await this.executeAutomatedAction(
        step.action,
        context,
      );

      automatedStep.endTime = new Date();
      automatedStep.status = 'COMPLETED';
      automatedStep.data = { ...step.data, result: actionResult };

      return {
        status: 'COMPLETED',
        stepId: step.id,
        result: actionResult,
        executionTime:
          automatedStep.endTime.getTime() - automatedStep.startTime.getTime(),
      };
    } catch (error) {
      automatedStep.endTime = new Date();
      automatedStep.status = 'FAILED';

      return {
        status: 'FAILED',
        stepId: step.id,
        error: error.message,
        executionTime:
          automatedStep.endTime.getTime() - automatedStep.startTime.getTime(),
      };
    }
  }

  private async executeDecisionStep(
    step: WorkflowStepDefinition,
    context: WorkflowContext,
  ): Promise<StepResult> {
    const decisionStep: WorkflowStep = {
      id: step.id,
      name: step.name,
      type: 'DECISION',
      status: 'IN_PROGRESS',
      data: step.data,
      startTime: new Date(),
    };

    try {
      // Evaluate decision condition
      const conditionResult = await this.evaluateCondition(
        step.condition,
        context,
      );

      // Determine next step based on condition
      const nextStepId = conditionResult ? step.trueStep : step.falseStep;

      decisionStep.endTime = new Date();
      decisionStep.status = 'COMPLETED';
      decisionStep.data = { ...step.data, conditionResult, nextStepId };

      // Update workflow context
      context.currentStepIndex = this.findStepIndex(
        nextStepId,
        context.definition,
      );

      return {
        status: 'COMPLETED',
        stepId: step.id,
        result: { conditionResult, nextStepId },
        executionTime:
          decisionStep.endTime.getTime() - decisionStep.startTime.getTime(),
      };
    } catch (error) {
      decisionStep.endTime = new Date();
      decisionStep.status = 'FAILED';

      return {
        status: 'FAILED',
        stepId: step.id,
        error: error.message,
        executionTime:
          decisionStep.endTime.getTime() - decisionStep.startTime.getTime(),
      };
    }
  }

  private async executeParallelStep(
    step: WorkflowStepDefinition,
    context: WorkflowContext,
  ): Promise<StepResult> {
    const parallelStep: WorkflowStep = {
      id: step.id,
      name: step.name,
      type: 'PARALLEL',
      status: 'IN_PROGRESS',
      data: step.data,
      startTime: new Date(),
    };

    try {
      // Execute all parallel steps concurrently
      const parallelResults = await Promise.allSettled(
        step.parallelSteps.map((parallelStep) =>
          this.executeStep(parallelStep, context),
        ),
      );

      // Check if all parallel steps completed successfully
      const allSuccessful = parallelResults.every(
        (result) =>
          result.status === 'fulfilled' && result.value.status === 'COMPLETED',
      );

      parallelStep.endTime = new Date();
      parallelStep.status = allSuccessful ? 'COMPLETED' : 'FAILED';
      parallelStep.data = {
        ...step.data,
        results: parallelResults.map((r) =>
          r.status === 'fulfilled' ? r.value : r.reason,
        ),
      };

      return {
        status: parallelStep.status,
        stepId: step.id,
        results: parallelResults,
        executionTime:
          parallelStep.endTime.getTime() - parallelStep.startTime.getTime(),
      };
    } catch (error) {
      parallelStep.endTime = new Date();
      parallelStep.status = 'FAILED';

      return {
        status: 'FAILED',
        stepId: step.id,
        error: error.message,
        executionTime:
          parallelStep.endTime.getTime() - parallelStep.startTime.getTime(),
      };
    }
  }
}
```

### Dynamic Report Generation

```typescript
interface ReportGeneration {
  reportId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  startTime: Date;
  endTime?: Date;
  fileSize?: number;
  recordCount?: number;
  error?: string;
}

@Injectable()
export class ReportGeneratorService {
  async generateReport(execution: ReportExecution): Promise<ReportGeneration> {
    const generation = new ReportGeneration();
    generation.reportId = execution.id;
    generation.status = 'PROCESSING';
    generation.startTime = new Date();

    try {
      // Get report definition
      const definition = await this.getReportDefinition(
        execution.reportDefinitionId,
      );

      // Execute data query
      const data = await this.executeDataQuery(
        definition,
        execution.parameters,
      );
      generation.recordCount = data.length;

      // Update progress
      generation.progress = 40;
      await this.updateExecutionProgress(execution.id, generation);

      // Process data
      const processedData = await this.processData(data, definition);
      generation.progress = 70;
      await this.updateExecutionProgress(execution.id, generation);

      // Generate report
      const reportFile = await this.generateReportFile(
        processedData,
        definition,
        execution.format,
      );
      generation.fileSize = reportFile.size;
      generation.progress = 90;
      await this.updateExecutionProgress(execution.id, generation);

      // Save report file
      const fileUrl = await this.saveReportFile(reportFile, execution);

      // Update execution
      execution.fileUrl = fileUrl;
      execution.fileSize = reportFile.size;
      execution.recordCount = data.length;
      execution.status = 'COMPLETED';
      execution.completedAt = new Date();
      execution.executionTime = Date.now() - generation.startTime.getTime();

      await this.reportExecutionRepository.save(execution);

      // Distribute report
      await this.distributeReport(execution);

      generation.status = 'COMPLETED';
      generation.endTime = new Date();

      return generation;
    } catch (error) {
      generation.status = 'FAILED';
      generation.error = error.message;
      generation.endTime = new Date();

      // Update execution with error
      execution.status = 'FAILED';
      execution.error = error.message;
      execution.completedAt = new Date();
      execution.executionTime = Date.now() - generation.startTime.getTime();

      await this.reportExecutionRepository.save(execution);

      return generation;
    }
  }

  private async executeDataQuery(
    definition: ReportDefinition,
    parameters: any,
  ): Promise<any[]> {
    const query = this.interpolateQuery(definition.query, parameters);

    switch (definition.dataSources[0].type) {
      case 'DATABASE':
        return await this.executeDatabaseQuery(query);
      case 'API':
        return await this.executeAPIQuery(definition.dataSources[0], query);
      case 'FILE':
        return await this.executeFileQuery(definition.dataSources[0], query);
      default:
        throw new Error(
          `Unsupported data source type: ${definition.dataSources[0].type}`,
        );
    }
  }

  private async generateReportFile(
    data: any[],
    definition: ReportDefinition,
    format: string,
  ): Promise<Buffer> {
    switch (format) {
      case 'PDF':
        return await this.generatePDFReport(data, definition);
      case 'EXCEL':
        return await this.generateExcelReport(data, definition);
      case 'CSV':
        return await this.generateCSVReport(data, definition);
      case 'JSON':
        return this.generateJSONReport(data);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private async generatePDFReport(
    data: any[],
    definition: ReportDefinition,
  ): Promise<Buffer> {
    const pdfGenerator = this.getPDFGenerator();

    const reportData = {
      data,
      template: definition.template,
      layout: definition.layout,
      styling: definition.styling,
      metadata: {
        title: definition.name,
        generatedAt: new Date(),
        recordCount: data.length,
      },
    };

    return await pdfGenerator.generate(reportData);
  }

  private async generateExcelReport(
    data: any[],
    definition: ReportDefinition,
  ): Promise<Buffer> {
    const excelGenerator = this.getExcelGenerator();

    const workbook = await excelGenerator.createWorkbook({
      data,
      template: definition.template,
      styling: definition.styling,
      metadata: {
        title: definition.name,
        generatedAt: new Date(),
        recordCount: data.length,
      },
    });

    return await excelGenerator.toBuffer(workbook);
  }

  private async distributeReport(execution: ReportExecution): Promise<void> {
    const distributionChannels =
      execution.reportDefinition.distributionChannels;

    for (const channel of distributionChannels) {
      switch (channel) {
        case 'EMAIL':
          await this.distributeViaEmail(execution);
          break;
        case 'WEBHOOK':
          await this.distributeViaWebhook(execution);
          break;
        case 'FILE_SYSTEM':
          await this.distributeToFileSystem(execution);
          break;
        default:
          this.logger.warn(`Unknown distribution channel: ${channel}`);
      }
    }
  }
}
```

### Integration Middleware

```typescript
@Injectable()
export class IntegrationMiddleware {
  async executeIntegration(
    integrationName: string,
    operation: IntegrationOperation,
  ): Promise<IntegrationResult> {
    const startTime = Date.now();

    // Create integration log
    const log = await this.createIntegrationLog(integrationName, operation);

    try {
      // Get integration configuration
      const config = await this.getIntegrationConfig(integrationName);

      // Execute operation
      const result = await this.executeOperation(config, operation);

      // Log success
      await this.logIntegrationSuccess(log, result, startTime);

      return result;
    } catch (error) {
      // Check if retry is needed
      if (this.shouldRetry(error, log)) {
        const retryResult = await this.retryIntegration(
          integrationName,
          operation,
          log,
        );
        return retryResult;
      }

      // Log failure
      await this.logIntegrationFailure(log, error, startTime);

      throw error;
    }
  }

  private async executeOperation(
    config: IntegrationConfig,
    operation: IntegrationOperation,
  ): Promise<IntegrationResult> {
    switch (config.type) {
      case 'REST_API':
        return await this.executeRESTAPI(config, operation);
      case 'SOAP_API':
        return await this.executeSOAPAPI(config, operation);
      case 'MESSAGE_QUEUE':
        return await this.executeMessageQueue(config, operation);
      case 'DATABASE':
        return await this.executeDatabase(config, operation);
      default:
        throw new Error(`Unsupported integration type: ${config.type}`);
    }
  }

  private async executeRESTAPI(
    config: IntegrationConfig,
    operation: IntegrationOperation,
  ): Promise<IntegrationResult> {
    const httpClient = this.getHTTPClient();

    const requestConfig = {
      method: operation.method || 'GET',
      url: `${config.baseUrl}${operation.endpoint}`,
      headers: {
        ...config.headers,
        ...operation.headers,
        'Content-Type': 'application/json',
      },
      params: operation.params,
      data: operation.data,
      timeout: config.timeout || 30000,
    };

    // Add authentication
    if (config.auth) {
      requestConfig.headers.Authorization = await this.getAuthHeader(
        config.auth,
      );
    }

    const response = await httpClient.request(requestConfig);

    return {
      status: 'SUCCESS',
      data: response.data,
      statusCode: response.status,
      headers: response.headers,
      responseTime: response.config.timeout || 0,
    };
  }

  private async retryIntegration(
    integrationName: string,
    operation: IntegrationOperation,
    originalLog: IntegrationLog,
  ): Promise<IntegrationResult> {
    const retryDelay = this.calculateRetryDelay(originalLog.retryCount);

    // Wait before retry
    await this.sleep(retryDelay);

    // Update retry count
    originalLog.retryCount++;
    await this.integrationLogRepository.save(originalLog);

    // Retry the operation
    return await this.executeIntegration(integrationName, operation);
  }

  private shouldRetry(error: Error, log: IntegrationLog): boolean {
    // Don't retry if max retries reached
    if (log.retryCount >= log.maxRetries) {
      return false;
    }

    // Retry on network errors
    if (error.name === 'NetworkError' || error.name === 'TimeoutError') {
      return true;
    }

    // Retry on 5xx server errors
    if (error.response?.status >= 500) {
      return true;
    }

    // Retry on 429 rate limit errors
    if (error.response?.status === 429) {
      return true;
    }

    return false;
  }

  private calculateRetryDelay(retryCount: number): number {
    // Exponential backoff with jitter
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const exponentialDelay = Math.min(
      baseDelay * Math.pow(2, retryCount),
      maxDelay,
    );
    const jitter = Math.random() * 1000; // Add up to 1 second jitter

    return exponentialDelay + jitter;
  }
}
```

---

## Integration Points

### Internal System Integrations

#### HR Subsystem Integration

```typescript
@Injectable()
export class HRSubsystemIntegrationService {
  async registerSubsystem(
    subsystemName: string,
    config: SubsystemConfig,
  ): Promise<void> {
    // Register event listeners
    await this.eventBusService.subscribe(subsystemName, [
      'EMPLOYEE_CREATED',
      'EMPLOYEE_UPDATED',
      'LEAVE_REQUESTED',
      'PERFORMANCE_REVIEW_COMPLETED',
    ]);

    // Register notification handlers
    await this.notificationService.registerHandlers(subsystemName, {
      EMPLOYEE_CREATED: this.handleEmployeeCreated,
      LEAVE_APPROVED: this.handleLeaveApproved,
      TRAINING_COMPLETED: this.handleTrainingCompleted,
    });

    // Register workflow triggers
    await this.workflowService.registerTriggers(subsystemName, {
      LEAVE_REQUEST: 'LEAVE_APPROVAL_WORKFLOW',
      PERFORMANCE_REVIEW: 'PERFORMANCE_CALIBRATION_WORKFLOW',
      TRAINING_ENROLLMENT: 'TRAINING_APPROVAL_WORKFLOW',
    });

    // Register report generators
    await this.reportService.registerGenerators(subsystemName, {
      MONTHLY_EMPLOYEE_REPORT: this.generateMonthlyEmployeeReport,
      QUARTERLY_TRAINING_REPORT: this.generateQuarterlyTrainingReport,
      ANNUAL_PERFORMANCE_REPORT: this.generateAnnualPerformanceReport,
    });
  }

  async handleEmployeeCreated(event: EmployeeCreatedEvent): Promise<void> {
    // Send welcome notification
    await this.notificationService.send({
      templateId: 'EMPLOYEE_WELCOME',
      recipientId: event.employeeId,
      variables: {
        firstName: event.firstName,
        employeeCode: event.employeeCode,
        startDate: event.startDate,
        managerName: event.managerName,
      },
      channels: ['EMAIL'],
      priority: 'HIGH',
    });

    // Start onboarding workflow
    await this.workflowService.start({
      workflowDefinitionId: 'EMPLOYEE_ONBOARDING',
      initiatorId: event.managerId,
      contextData: {
        employeeId: event.employeeId,
        employeeCode: event.employeeCode,
        startDate: event.startDate,
      },
    });

    // Generate initial reports
    await this.reportService.generate({
      reportDefinitionId: 'EMPLOYEE_PROFILE_REPORT',
      parameters: { employeeId: event.employeeId },
      requestedBy: event.managerId,
    });
  }
}
```

#### External System Integration

```typescript
@Injectable()
export class ExternalSystemIntegrationService {
  async syncWithFinanceSystem(data: FinanceSyncData): Promise<void> {
    const integrationName = 'FINANCE_SYSTEM';

    // Sync employee compensation changes
    for (const compensation of data.compensationChanges) {
      await this.integrationMiddleware.executeIntegration(integrationName, {
        endpoint: '/api/employees/compensation',
        method: 'POST',
        data: {
          employeeId: compensation.employeeId,
          newSalary: compensation.newSalary,
          effectiveDate: compensation.effectiveDate,
          reason: compensation.reason,
        },
      });
    }

    // Sync training expenses
    for (const expense of data.trainingExpenses) {
      await this.integrationMiddleware.executeIntegration(integrationName, {
        endpoint: '/api/expenses/training',
        method: 'POST',
        data: {
          employeeId: expense.employeeId,
          amount: expense.amount,
          courseId: expense.courseId,
          date: expense.date,
          description: expense.description,
        },
      });
    }
  }

  async syncWithAttendanceSystem(data: AttendanceSyncData): Promise<void> {
    const integrationName = 'ATTENDANCE_SYSTEM';

    // Sync attendance records
    for (const attendance of data.attendanceRecords) {
      await this.integrationMiddleware.executeIntegration(integrationName, {
        endpoint: '/api/attendance',
        method: 'POST',
        data: {
          employeeId: attendance.employeeId,
          date: attendance.date,
          clockIn: attendance.clockIn,
          clockOut: attendance.clockOut,
          hours: attendance.hours,
          overtime: attendance.overtime,
        },
      });
    }

    // Sync leave requests
    for (const leave of data.leaveRequests) {
      await this.integrationMiddleware.executeIntegration(integrationName, {
        endpoint: '/api/leave',
        method: 'POST',
        data: {
          employeeId: leave.employeeId,
          leaveType: leave.leaveType,
          startDate: leave.startDate,
          endDate: leave.endDate,
          status: leave.status,
          days: leave.days,
        },
      });
    }
  }
}
```

---

## Security & Permissions

### Permission Matrix

| Permission                          | Employee | Manager   | HR Manager | Admin |
| ----------------------------------- | -------- | --------- | ---------- | ----- |
| `hr:shared:notifications:send`      | ✅       | ✅        | ✅         | ✅    |
| `hr:shared:notifications:templates` | ❌       | ❌        | ✅         | ✅    |
| `hr:shared:workflows:start`         | ✅       | ✅        | ✅         | ✅    |
| `hr:shared:workflows:manage`        | ❌       | ❌        | ✅         | ✅    |
| `hr:shared:reports:generate`        | ✅       | ✅        | ✅         | ✅    |
| `hr:shared:reports:manage`          | ❌       | ❌        | ✅         | ✅    |
| `hr:shared:integrations:sync`       | ❌       | ❌        | ✅         | ✅    |
| `hr:shared:integrations:logs`       | ❌       | ❌        | ✅         | ✅    |
| `hr:shared:analytics:view`          | ❌       | ✅ (team) | ✅         | ✅    |

### Data Protection Measures

#### Template Content Encryption

```typescript
@Injectable()
export class TemplateSecurityService {
  async encryptTemplate(
    template: NotificationTemplate,
  ): Promise<NotificationTemplate> {
    const sensitiveFields = ['subjectTemplate', 'bodyTemplate', 'htmlTemplate'];
    const encrypted = { ...template };

    for (const field of sensitiveFields) {
      if (template[field]) {
        encrypted[field] = await this.encrypt(template[field]);
      }
    }

    return encrypted;
  }

  async decryptTemplate(
    encrypted: NotificationTemplate,
  ): Promise<NotificationTemplate> {
    const sensitiveFields = ['subjectTemplate', 'bodyTemplate', 'htmlTemplate'];
    const decrypted = { ...encrypted };

    for (const field of sensitiveFields) {
      if (encrypted[field]) {
        decrypted[field] = await this.decrypt(encrypted[field]);
      }
    }

    return decrypted;
  }

  private async encrypt(text: string): Promise<string> {
    const key = await this.getEncryptionKey();
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipher('aes-256-cbc', key);
    cipher.setAutoPadding(true);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }

  private async decrypt(encryptedText: string): Promise<string> {
    const key = await this.getEncryptionKey();
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    const decipher = crypto.createDecipher('aes-256-cbc', key);
    decipher.setAutoPadding(true);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

#### Workflow Data Protection

```typescript
@Injectable()
export class WorkflowSecurityService {
  async encryptWorkflowData(data: any): Promise<any> {
    const sensitiveFields = ['contextData', 'outputData'];
    const encrypted = { ...data };

    for (const field of sensitiveFields) {
      if (data[field]) {
        encrypted[field] = await this.encrypt(JSON.stringify(data[field]));
      }
    }

    return encrypted;
  }

  async decryptWorkflowData(encrypted: any): Promise<any> {
    const sensitiveFields = ['contextData', 'outputData'];
    const decrypted = { ...encrypted };

    for (const field of sensitiveFields) {
      if (encrypted[field]) {
        decrypted[field] = JSON.parse(await this.decrypt(encrypted[field]));
      }
    }

    return decrypted;
  }

  async validateWorkflowAccess(
    userId: string,
    workflowId: string,
    action: string,
  ): Promise<boolean> {
    const workflow = await this.workflowRepository.findById(workflowId);
    const user = await this.userService.findById(userId);

    // Check if user is initiator
    if (workflow.initiatorId === userId) {
      return true;
    }

    // Check if user is current assignee
    if (workflow.currentAssigneeId === userId) {
      return true;
    }

    // Check if user is in participants
    if (workflow.participants?.includes(userId)) {
      return true;
    }

    // Check if user has workflow management permissions
    const hasPermission = await this.permissionService.hasPermission(
      userId,
      `hr:shared:workflows:${action}`,
    );

    return hasPermission;
  }
}
```

---

## Implementation Guidelines

### Development Environment Setup

#### Prerequisites

```bash
# Node.js 18+ required
node --version

# PostgreSQL 14+ required
psql --version

# Redis for caching
redis-server --version

# Message queue (RabbitMQ or similar)
rabbitmqctl status

# Environment setup
cp .env.example .env
# Configure environment variables
```

#### Database Setup

```bash
# Create database
createdb blih_hr_shared

# Run migrations
npm run migration:run

# Seed data
npm run seed:shared
```

### Code Organization Patterns

#### Service Layer Structure

```typescript
@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationMessage)
    private messageRepository: Repository<NotificationMessage>,
    @InjectRepository(NotificationTemplate)
    private templateRepository: Repository<NotificationTemplate>,
    private deliveryService: NotificationDeliveryService,
    private templateService: TemplateService,
    private auditService: AuditService,
  ) {}

  async sendNotification(
    sendDto: SendNotificationDto,
    userId: string,
  ): Promise<NotificationMessage> {
    // Get template
    const template = await this.templateRepository.findById(sendDto.templateId);

    // Render template with variables
    const rendered = await this.templateService.render(
      template,
      sendDto.variables,
    );

    // Create message
    const message = this.messageRepository.create({
      ...sendDto,
      ...rendered,
      status: 'PENDING',
      correlationId: this.generateCorrelationId(),
      sourceSystem: 'HR_SHARED',
    });

    const savedMessage = await this.messageRepository.save(message);

    // Send notification
    const delivery = await this.deliveryService.sendNotification(savedMessage);

    // Update message status
    await this.updateMessageStatus(savedMessage.id, delivery);

    // Audit log
    await this.auditService.logAction(
      'NOTIFICATION_SENT',
      savedMessage.id,
      userId,
    );

    return savedMessage;
  }
}
```

---

## Testing Procedures

### Unit Testing Example

```typescript
describe('NotificationDeliveryService', () => {
  let service: NotificationDeliveryService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [NotificationDeliveryService],
    }).compile();

    service = module.get<NotificationDeliveryService>(
      NotificationDeliveryService,
    );
  });

  describe('sendNotification', () => {
    it('should deliver notification successfully', async () => {
      const message = createMockNotificationMessage();

      const result = await service.sendNotification(message);

      expect(result.status).toBe('SENT');
      expect(result.deliveryResults).toHaveLength(2);
      expect(result.fallbackUsed).toBe(false);
    });
  });
});
```

---

## Deployment Instructions

### Environment Configuration

#### Production Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/blih_hr_shared
DATABASE_SSL=true

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Message Queue
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_USER=guest
RABBITMQ_PASS=guest

# Authentication
KEYCLOAK_URL=https://keycloak.example.com
KEYCLOAK_REALM=blih-hr
KEYCLOAK_CLIENT_ID=shared-services

# Email Service
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=hr@example.com
SMTP_PASS=smtp-password

# SMS Service
SMS_PROVIDER_URL=https://api.sms-provider.com
SMS_PROVIDER_API_KEY=your-sms-api-key

# Push Notification Service
PUSH_SERVICE_URL=https://api.push-service.com
PUSH_SERVICE_KEY=your-push-service-key

# Security
TEMPLATE_ENCRYPTION_KEY=your-encryption-key
WORKFLOW_ENCRYPTION_KEY=your-workflow-key
JWT_SECRET=your-jwt-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### Docker Deployment

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  shared-api:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/blih_hr_shared
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    depends_on:
      - db
      - redis
      - rabbitmq
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=blih_hr_shared
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      - RABBITMQ_DEFAULT_USER=guest
      - RABBITMQ_DEFAULT_PASS=guest
    ports:
      - '5672:5672'
      - '15672:15672'
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - shared-api
    restart: unless-stopped

volumes:
  postgres_data:
  rabbitmq_data:
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### Notification Delivery Issues

**Problem:** Notifications not being delivered

```
Expected: Delivered, Actual: Failed
```

**Solutions:**

1. Check message queue status
2. Verify external service connectivity
3. Review template rendering

#### Workflow Execution Issues

**Problem:** Workflow stuck in pending state

```
Expected: Completed, Actual: Pending
```

**Solutions:**

1. Check current step assignee
2. Verify step timeout configuration
3. Review workflow definition

#### Report Generation Issues

**Problem:** Report generation failing

```
Expected: Generated, Actual: Failed
```

**Solutions:**

1. Check data source connectivity
2. Verify query syntax
3. Review template configuration

### Performance Optimization

#### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_notification_messages_recipient_status
ON notification_messages(recipient_id, status);

CREATE INDEX CONCURRENTLY idx_workflow_instances_status_started
ON workflow_instances(status, started_at);

CREATE INDEX CONCURRENTLY idx_report_executions_definition_status
ON report_executions(report_definition_id, status);

-- Partition large tables
CREATE TABLE notification_messages_2026_q1 PARTITION OF notification_messages
FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');
```

#### Caching Strategy

```typescript
@Injectable()
export class SharedServicesCacheService {
  async getTemplate(templateId: string): Promise<NotificationTemplate> {
    const cacheKey = `template:${templateId}`;

    let template = await this.cacheManager.get<NotificationTemplate>(cacheKey);
    if (!template) {
      template = await this.templateRepository.findById(templateId);
      await this.cacheManager.set(cacheKey, template, 3600); // 1 hour
    }

    return template;
  }
}
```

This comprehensive documentation provides complete technical guidance for implementing and maintaining the HR Shared Services System.
