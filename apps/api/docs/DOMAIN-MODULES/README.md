# BLIH System Domain Modules Documentation

## Overview

Domain modules represent business-specific functionality within the BLIH System. Each module is designed as a bounded context with its own business logic, data models, and API endpoints. These modules can be easily extracted into microservices as the system scales.

## Module Architecture

```
src/domains/
├── ai/                 # AI services and knowledge management
├── brain/              # Knowledge base and cognitive services
├── chatbot/            # AI-powered assistance
├── crm/                # Customer relationship management
├── finance/            # Financial management
├── hr/                 # Human resources management
└── project/            # Project management
```

## AI Module (`ai/`)

### Purpose

Provides AI-powered services including text generation, analysis, and machine learning capabilities.

### Key Components

#### Controllers

- **AiController**: AI service endpoints
- **GenerationController**: Text generation endpoints
- **AnalysisController**: Data analysis endpoints

#### Services

- **AiService**: Core AI functionality
- **TextGenerationService**: Text generation logic
- **DataAnalysisService**: Data analysis and insights
- **ModelService**: AI model management

#### Features

- Text generation and completion
- Data analysis and insights
- Sentiment analysis
- Language translation
- Content summarization
- AI model integration

### AI Service Model

```typescript
interface AiRequest {
  prompt: string;
  context?: Record<string, any>;
  options?: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  };
}

interface AiResponse {
  generatedText: string;
  confidence: number;
  tokensUsed: number;
  processingTime: number;
  metadata: Record<string, any>;
}
```

### Key Endpoints

#### Generate Text

```http
POST /api/v1/ai/generate
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "prompt": "Generate a project status summary",
  "context": {
    "projectId": "project-uuid",
    "userId": "user-uuid"
  },
  "options": {
    "maxTokens": 1000,
    "temperature": 0.7,
    "model": "gpt-4"
  }
}
```

#### Analyze Sentiment

```http
POST /api/v1/ai/analyze/sentiment
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "text": "The project is progressing well and the team is motivated.",
  "language": "en"
}
```

#### Summarize Content

```http
POST /api/v1/ai/summarize
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "content": "Long text content to summarize...",
  "summaryLength": "medium",
  "format": "bullet-points"
}
```

## Brain Module (`brain/`)

### Purpose

Manages the knowledge base, cognitive services, and information retrieval capabilities.

### Key Components

#### Controllers

- **BrainController**: Knowledge base endpoints
- **KnowledgeController**: Knowledge management
- **SearchController**: Information retrieval

#### Services

- **BrainService**: Core brain functionality
- **KnowledgeService**: Knowledge base management
- **SearchService**: Information retrieval
- **CognitiveService**: Cognitive processing

#### Features

- Knowledge base management
- Semantic search
- Information retrieval
- Knowledge graph
- Cognitive processing
- Learning and adaptation

### Knowledge Model

```typescript
interface Knowledge {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  metadata: Record<string, any>;
  authorId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SearchQuery {
  query: string;
  filters?: {
    category?: string;
    tags?: string[];
    authorId?: string;
    dateRange?: {
      from: Date;
      to: Date;
    };
  };
  options?: {
    maxResults?: number;
    relevanceThreshold?: number;
  };
}
```

### Key Endpoints

#### Search Knowledge

```http
POST /api/v1/brain/search
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "query": "project management best practices",
  "filters": {
    "category": "project-management",
    "tags": ["best-practices", "methodology"]
  },
  "options": {
    "maxResults": 10,
    "relevanceThreshold": 0.7
  }
}
```

#### Create Knowledge Entry

```http
POST /api/v1/brain/knowledge
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Agile Project Management Guide",
  "content": "Comprehensive guide to agile methodologies...",
  "category": "project-management",
  "tags": ["agile", "scrum", "kanban"],
  "isPublic": true
}
```

#### Get Knowledge Entry

```http
GET /api/v1/brain/knowledge/{knowledgeId}
Authorization: Bearer {token}
```

## Chatbot Module (`chatbot/`)

### Purpose

Provides AI-powered conversational interfaces for user assistance and automation.

### Key Components

#### Controllers

- **ChatbotController**: Chatbot endpoints
- **ConversationController**: Conversation management
- **IntentController**: Intent recognition

#### Services

- **ChatbotService**: Core chatbot functionality
- **ConversationService**: Conversation management
- **IntentService**: Intent recognition
- **ResponseService**: Response generation

#### Features

- Natural language processing
- Intent recognition
- Context-aware responses
- Multi-turn conversations
- Integration with business systems
- Analytics and insights

### Conversation Model

```typescript
interface Conversation {
  id: string;
  userId: string;
  sessionId: string;
  messages: Message[];
  context: Record<string, any>;
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

enum ConversationStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}
```

### Key Endpoints

#### Start Conversation

```http
POST /api/v1/chatbot/conversations
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "initialMessage": "Hello, I need help with project management",
  "context": {
    "projectId": "project-uuid",
    "department": "IT"
  }
}
```

#### Send Message

```http
POST /api/v1/chatbot/conversations/{conversationId}/messages
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "message": "What are the best practices for agile development?"
}
```

#### Get Conversation History

```http
GET /api/v1/chatbot/conversations/{conversationId}
Authorization: Bearer {token}
```

## CRM Module (`crm/`)

### Purpose

Manages customer relationships, sales pipelines, and customer interactions.

### Key Components

#### Controllers

- **CustomersController**: Customer management
- **ContactsController**: Contact management
- **OpportunitiesController**: Sales opportunities
- **InteractionsController**: Customer interactions

#### Services

- **CustomersService**: Customer management logic
- **ContactsService**: Contact management
- **OpportunitiesService**: Sales pipeline management
- **InteractionsService**: Interaction tracking

#### Features

- Customer profile management
- Contact management
- Sales pipeline tracking
- Opportunity management
- Interaction history
- Customer analytics

### Customer Model

```typescript
interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  industry: string;
  size: CompanySize;
  website?: string;
  phone?: string;
  email?: string;
  address: Address;
  contacts: Contact[];
  opportunities: Opportunity[];
  status: CustomerStatus;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Opportunity {
  id: string;
  customerId: string;
  name: string;
  value: number;
  currency: string;
  stage: OpportunityStage;
  probability: number;
  expectedCloseDate: Date;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Key Endpoints

#### List Customers

```http
GET /api/v1/crm/customers?page=1&limit=10&industry=technology&status=active
Authorization: Bearer {token}
```

#### Create Customer

```http
POST /api/v1/crm/customers
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Acme Corporation",
  "type": "COMPANY",
  "industry": "Technology",
  "size": "MEDIUM",
  "website": "https://acme.com",
  "email": "info@acme.com",
  "phone": "+1234567890",
  "address": {
    "street": "123 Business St",
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "postalCode": "94105"
  },
  "assignedTo": "user-uuid"
}
```

#### Create Opportunity

```http
POST /api/v1/crm/opportunities
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "customerId": "customer-uuid",
  "name": "Enterprise Software License",
  "value": 50000,
  "currency": "USD",
  "stage": "PROPOSAL",
  "probability": 70,
  "expectedCloseDate": "2024-03-31",
  "assignedTo": "user-uuid"
}
```

## Finance Module (`finance/`)

### Purpose

Handles financial management, accounting, budgeting, and financial reporting.

### Key Components

#### Controllers

- **TransactionsController**: Transaction management
- **AccountsController**: Account management
- **BudgetsController**: Budget management
- **ReportsController**: Financial reports

#### Services

- **TransactionsService**: Transaction processing
- **AccountsService**: Account management
- **BudgetsService**: Budget tracking
- **ReportsService**: Financial reporting

#### Features

- Transaction management
- Account reconciliation
- Budget tracking
- Financial reporting
- Expense management
- Revenue tracking

### Financial Model

```typescript
interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  currency: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  date: Date;
  status: TransactionStatus;
  metadata: Record<string, any>;
  createdBy: string;
  createdAt: Date;
}

interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Budget {
  id: string;
  name: string;
  departmentId: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  currency: string;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  status: BudgetStatus;
}
```

### Key Endpoints

#### List Transactions

```http
GET /api/v1/finance/transactions?page=1&limit=10&accountId=acc-uuid&fromDate=2024-01-01
Authorization: Bearer {token}
```

#### Create Transaction

```http
POST /api/v1/finance/transactions
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "accountId": "account-uuid",
  "amount": 1500.0,
  "currency": "USD",
  "type": "EXPENSE",
  "category": "SOFTWARE_LICENSES",
  "description": "Annual software license renewal",
  "date": "2024-01-15",
  "metadata": {
    "vendor": "Software Corp",
    "invoiceNumber": "INV-2024-001"
  }
}
```

#### Get Budget Summary

```http
GET /api/v1/finance/budgets/summary?departmentId=dept-uuid&period=2024-Q1
Authorization: Bearer {token}
```

#### Generate Financial Report

```http
POST /api/v1/finance/reports
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "type": "PROFIT_AND_LOSS",
  "period": {
    "from": "2024-01-01",
    "to": "2024-03-31"
  },
  "format": "PDF",
  "includeDetails": true
}
```

## HR Module (`hr/`)

### Purpose

Manages human resources including employee records, payroll, benefits, and performance management.

### Key Components

#### Controllers

- **EmployeesController**: Employee management
- **DepartmentsController**: Department management
- **PayrollController**: Payroll processing
- **PerformanceController**: Performance management

#### Services

- **EmployeesService**: Employee management
- **DepartmentsService**: Department management
- **PayrollService**: Payroll processing
- **PerformanceService**: Performance tracking

#### Features

- Employee profile management
- Department organization
- Payroll processing
- Benefits management
- Performance tracking
- Leave management

### Employee Model

```typescript
interface Employee {
  id: string;
  userId: string;
  employeeNumber: string;
  departmentId: string;
  position: string;
  employmentType: EmploymentType;
  salary: Salary;
  benefits: Benefit[];
  performance: PerformanceRecord[];
  status: EmployeeStatus;
  hireDate: Date;
  terminationDate?: Date;
  managerId?: string;
  reports: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Department {
  id: string;
  name: string;
  description?: string;
  managerId: string;
  parentId?: string;
  budget: number;
  employeeCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Key Endpoints

#### List Employees

```http
GET /api/v1/hr/employees?page=1&limit=10&departmentId=dept-uuid&status=active
Authorization: Bearer {token}
```

#### Create Employee

```http
POST /api/v1/hr/employees
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "userId": "user-uuid",
  "employeeNumber": "EMP-001",
  "departmentId": "dept-uuid",
  "position": "Senior Developer",
  "employmentType": "FULL_TIME",
  "salary": {
    "baseAmount": 85000,
    "currency": "USD",
    "payFrequency": "MONTHLY"
  },
  "hireDate": "2024-01-15",
  "managerId": "manager-uuid"
}
```

#### Process Payroll

```http
POST /api/v1/hr/payroll/process
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "period": "2024-01",
  "departmentId": "dept-uuid",
  "includeBonuses": true,
  "processDate": "2024-01-31"
}
```

#### Add Performance Review

```http
POST /api/v1/hr/employees/{employeeId}/performance
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "reviewType": "ANNUAL",
  "period": "2024",
  "rating": 4.5,
  "strengths": ["Technical skills", "Team collaboration"],
  "areasForImprovement": ["Communication skills"],
  "goals": ["Lead a project", "Mentor junior developers"],
  "reviewerId": "reviewer-uuid"
}
```

## Project Module (`project/`)

### Purpose

Manages projects, tasks, resources, and project collaboration.

### Key Components

#### Controllers

- **ProjectsController**: Project management
- **TasksController**: Task management
- **ResourcesController**: Resource management
- **CollaborationController**: Team collaboration

#### Services

- **ProjectsService**: Project management logic
- **TasksService**: Task tracking
- **ResourcesService**: Resource allocation
- **CollaborationService**: Team collaboration

#### Features

- Project lifecycle management
- Task tracking and assignment
- Resource allocation
- Team collaboration
- Progress tracking
- Project analytics

### Project Model

```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: Date;
  endDate?: Date;
  budget?: number;
  currency?: string;
  managerId: string;
  teamMembers: ProjectMember[];
  tasks: Task[];
  milestones: Milestone[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  estimatedHours?: number;
  actualHours?: number;
  startDate?: Date;
  dueDate?: Date;
  dependencies: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectMember {
  userId: string;
  role: ProjectRole;
  joinDate: Date;
  allocation: number; // Percentage allocation
}
```

### Key Endpoints

#### List Projects

```http
GET /api/v1/projects?page=1&limit=10&status=active&managerId=user-uuid
Authorization: Bearer {token}
```

#### Create Project

```http
POST /api/v1/projects
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Mobile App Development",
  "description": "Develop a cross-platform mobile application",
  "status": "PLANNING",
  "priority": "HIGH",
  "startDate": "2024-02-01",
  "endDate": "2024-06-30",
  "budget": 200000,
  "currency": "USD",
  "managerId": "manager-uuid"
}
```

#### Create Task

```http
POST /api/v1/projects/{projectId}/tasks
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Design user interface",
  "description": "Create wireframes and mockups for the mobile app",
  "status": "TODO",
  "priority": "HIGH",
  "assigneeId": "designer-uuid",
  "estimatedHours": 40,
  "dueDate": "2024-02-15",
  "tags": ["design", "ui", "ux"]
}
```

#### Get Project Progress

```http
GET /api/v1/projects/{projectId}/progress
Authorization: Bearer {token}
```

#### Add Team Member

```http
POST /api/v1/projects/{projectId}/members
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "userId": "user-uuid",
  "role": "DEVELOPER",
  "allocation": 75
}
```

## Cross-Domain Features

### Common Patterns

#### Search and Filtering

All domain modules support consistent search and filtering:

```typescript
interface SearchParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}
```

#### Audit Trail

All domain entities include audit fields:

```typescript
interface AuditableEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

#### Status Management

Common status patterns across domains:

```typescript
interface Statusable {
  status: string;
  statusHistory: StatusChange[];
}
```

### Integration Patterns

#### Event-Driven Communication

Domain modules communicate through events:

```typescript
interface DomainEvent {
  type: string;
  aggregateId: string;
  data: Record<string, any>;
  timestamp: Date;
  userId: string;
}
```

#### Shared Services

Common services used across domains:

- **NotificationService**: Cross-domain notifications
- **AuditService**: Unified audit logging
- **ValidationService**: Data validation
- **SearchService**: Unified search capabilities

## Module Dependencies

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Module     │────│  Brain Module   │────│ Chatbot Module  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CRM Module    │────│  Project Module │────│    HR Module    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Finance Module │────│  Core Modules   │────│ Platform Layer  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Security Considerations

### Data Access Control

- Domain-specific permissions
- Resource-level authorization
- Data ownership validation
- Cross-domain access controls

### Data Privacy

- PII protection
- Data encryption
- Access logging
- Compliance requirements

## Performance Considerations

### Caching Strategy

- Domain-specific caching
- Cross-domain cache invalidation
- Query optimization
- Batch operations

### Scalability

- Horizontal scaling readiness
- Database optimization
- Async processing
- Resource management

## Testing Strategy

### Domain Testing

- Business logic validation
- Domain rules enforcement
- Integration testing
- End-to-end workflows

### Data Validation

- Input validation
- Business rule validation
- Data integrity checks
- Constraint validation

The domain modules provide business-specific functionality while maintaining clean architecture principles and enabling future microservice extraction. Each module is designed as a self-contained bounded context with clear interfaces and responsibilities.
