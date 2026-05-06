# BLIH Testing Guide

**Version:** 1.0  
**Last Updated:** February 2026  
**For:** Developers, QA Engineers, DevOps

---

## Table of Contents

1. [Testing Philosophy](#1-testing-philosophy)
2. [Testing Strategy](#2-testing-strategy)
3. [Unit Testing](#3-unit-testing)
4. [Integration Testing](#4-integration-testing)
5. [E2E Testing](#5-e2e-testing)
6. [API Testing](#6-api-testing)
7. [Performance Testing](#7-performance-testing)
8. [Security Testing](#8-security-testing)
9. [Test Data Management](#9-test-data-management)
10. [CI/CD Integration](#10-cicd-integration)
11. [Code Coverage](#11-code-coverage)
12. [Testing Checklist](#12-testing-checklist)

---

## 1. Testing Philosophy

### 1.1 Testing Pyramid

```
                    /\
                   /  \
                  / E2E \          10% - End-to-End Tests
                 /______\          (Critical user journeys)
                /        \
               /  INTEG.  \        30% - Integration Tests
              /____________\       (Module interactions)
             /              \
            /      UNIT       \    60% - Unit Tests
           /__________________\   (Functions, methods, logic)
```

### 1.2 Core Principles

| Principle         | Description                             |
| ----------------- | --------------------------------------- |
| **Fast Feedback** | Tests should run quickly in development |
| **Deterministic** | Same input = same output, every time    |
| **Isolated**      | Tests don't depend on each other        |
| **Maintainable**  | Easy to understand and update           |
| **Comprehensive** | Cover edge cases, not just happy paths  |
| **Automated**     | Run in CI/CD pipeline automatically     |

### 1.3 Coverage Goals

| Type                        | Coverage Target | Why                                      |
| --------------------------- | --------------- | ---------------------------------------- |
| **Critical Business Logic** | 90%+            | Financial calculations, compliance rules |
| **Services**                | 80%+            | Core business operations                 |
| **Controllers**             | 70%+            | API endpoints                            |
| **Utilities**               | 85%+            | Shared helper functions                  |
| **Overall**                 | 75%+            | Healthy codebase indicator               |

---

## 2. Testing Strategy

### 2.1 What to Test

#### ✅ **Always Test:**

- Business logic and rules
- Data validation
- Error handling
- Edge cases
- Security controls
- Critical user paths

#### ⚠️ **Consider Testing:**

- Complex UI interactions
- Third-party integrations
- Performance bottlenecks
- Accessibility features

#### ❌ **Don't Test:**

- Third-party library internals
- Trivial getters/setters
- Framework code
- Generated code

### 2.2 Testing Quadrants

```
         Manual                           Automated
    ┌─────────────────┬─────────────────────────┐
    │                 │                         │
    │  Exploratory    │  Acceptance Testing     │
    │  Testing        │  (E2E, User Stories)    │
    │                 │                         │
Business ├─────────────────┼─────────────────────────┤
Facing  │                 │                         │
    │  Usability      │  Unit Tests             │
    │  Testing        │  Integration Tests      │
    │                 │                         │
    └─────────────────┴─────────────────────────┘
Technology                            Critique
Facing                               Product
```

---

## 3. Unit Testing

### 3.1 Unit Test Structure (AAA Pattern)

```typescript
describe('MoneyService', () => {
  let service: MoneyService;

  beforeEach(() => {
    service = new MoneyService();
  });

  describe('convert', () => {
    it('should convert USD to ETB correctly', () => {
      // Arrange
      const amount = 100;
      const fromCurrency = 'USD';
      const toCurrency = 'ETB';
      const exchangeRate = 55.5;

      // Act
      const result = service.convert(
        amount,
        fromCurrency,
        toCurrency,
        exchangeRate,
      );

      // Assert
      expect(result).toBe(5550);
    });

    it('should throw error for invalid currency', () => {
      expect(() => {
        service.convert(100, 'INVALID', 'ETB', 55.5);
      }).toThrow('Invalid currency code');
    });

    it('should handle zero amount', () => {
      const result = service.convert(0, 'USD', 'ETB', 55.5);
      expect(result).toBe(0);
    });
  });
});
```

### 3.2 Mocking Dependencies

```typescript
describe('EmployeeService', () => {
  let service: EmployeeService;
  let mockRepository: jest.Mocked<EmployeeRepository>;
  let mockEventBus: jest.Mocked<EventBusService>;
  let mockAuditService: jest.Mocked<AuditService>;

  beforeEach(() => {
    // Create mocks
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
    } as any;

    mockEventBus = {
      publish: jest.fn(),
    } as any;

    mockAuditService = {
      log: jest.fn(),
    } as any;

    // Inject mocks
    service = new EmployeeService(
      mockRepository,
      mockEventBus,
      mockAuditService,
    );
  });

  it('should create employee and publish event', async () => {
    // Arrange
    const dto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    };
    const savedEmployee = { id: '123', ...dto };
    mockRepository.save.mockResolvedValue(savedEmployee);

    // Act
    const result = await service.create(dto, mockUser);

    // Assert
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(dto),
    );
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      'hr.employee.created',
      expect.objectContaining({ employeeId: '123' }),
    );
    expect(result).toEqual(savedEmployee);
  });
});
```

### 3.3 Testing Async Code

```typescript
describe('AsyncOperations', () => {
  it('should handle promise resolution', async () => {
    const result = await service.fetchData();
    expect(result).toBeDefined();
  });

  it('should handle promise rejection', async () => {
    await expect(service.fetchInvalidData()).rejects.toThrow('Not found');
  });

  it('should timeout after 5 seconds', async () => {
    jest.setTimeout(6000);
    await expect(service.longRunningOperation()).rejects.toThrow('Timeout');
  });
});
```

### 3.4 Testing Private Methods

```typescript
// Don't test private methods directly!
// Test them through public methods

class Calculator {
  public add(a: number, b: number): number {
    return this.sum(a, b); // private method
  }

  private sum(a: number, b: number): number {
    return a + b;
  }
}

// ✅ Good: Test through public API
it('should add numbers correctly', () => {
  const calc = new Calculator();
  expect(calc.add(2, 3)).toBe(5);
});

// ❌ Bad: Testing private method directly
// Don't do this!
```

---

## 4. Integration Testing

### 4.1 Database Integration Tests

```typescript
describe('EmployeeRepository (Integration)', () => {
  let connection: DataSource;
  let repository: EmployeeRepository;

  beforeAll(async () => {
    // Setup test database
    connection = await createTestDatabase();
    repository = connection.getRepository(Employee);
  });

  afterAll(async () => {
    await connection.destroy();
  });

  beforeEach(async () => {
    // Clean database before each test
    await repository.clear();
  });

  it('should save and retrieve employee', async () => {
    // Arrange
    const employee = repository.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      company_id: 'BLIH',
    });

    // Act
    await repository.save(employee);
    const found = await repository.findOne({
      where: { email: 'john@example.com' },
    });

    // Assert
    expect(found).toBeDefined();
    expect(found.firstName).toBe('John');
  });

  it('should enforce unique email constraint', async () => {
    const employee1 = repository.create({
      email: 'john@example.com',
      company_id: 'BLIH',
    });
    await repository.save(employee1);

    const employee2 = repository.create({
      email: 'john@example.com',
      company_id: 'BLIH',
    });

    await expect(repository.save(employee2)).rejects.toThrow();
  });
});
```

### 4.2 RabbitMQ Integration Tests

```typescript
describe('Event Bus (Integration)', () => {
  let eventBus: EventBusService;
  let connection: Connection;

  beforeAll(async () => {
    connection = await createRabbitMQConnection();
    eventBus = new EventBusService(connection);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should publish and consume events', async () => {
    const eventData = { employeeId: '123', action: 'created' };
    const received: any[] = [];

    // Subscribe
    await eventBus.subscribe('hr.employee.created', (event) => {
      received.push(event);
    });

    // Publish
    await eventBus.publish('hr.employee.created', eventData);

    // Wait for async processing
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject(eventData);
  });
});
```

---

## 5. E2E Testing

### 5.1 Playwright E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Employee Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3001/login');
    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should create new employee', async ({ page }) => {
    // Navigate to employees
    await page.click('text=HR');
    await page.click('text=Employees');
    await page.waitForURL('**/hr/employees');

    // Click create button
    await page.click('button:has-text("New Employee")');

    // Fill form
    await page.fill('[name="firstName"]', 'John');
    await page.fill('[name="lastName"]', 'Doe');
    await page.fill('[name="email"]', 'john.doe@test.com');
    await page.fill('[name="phone"]', '+251912345678');

    // Submit
    await page.click('button:has-text("Create")');

    // Verify success
    await expect(
      page.locator('text=Employee created successfully'),
    ).toBeVisible();
    await expect(page.locator('text=John Doe')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('http://localhost:3001/hr/employees/new');

    // Try to submit empty form
    await page.click('button:has-text("Create")');

    // Check validation errors
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
  });
});
```

### 5.2 Critical User Journeys

```typescript
test.describe('Critical Journeys', () => {
  test('Employee Onboarding Journey', async ({ page }) => {
    // 1. Create recruitment request
    await createRecruitmentRequest(page, {
      position: 'Software Engineer',
      department: 'Engineering',
    });

    // 2. Post job
    await postJob(page);

    // 3. Add candidate
    await addCandidate(page, {
      name: 'Jane Smith',
      email: 'jane@example.com',
    });

    // 4. Schedule interview
    await scheduleInterview(page);

    // 5. Submit feedback
    await submitInterviewFeedback(page, { recommendation: 'HIRE' });

    // 6. Make offer
    await makeOffer(page);

    // 7. Onboard employee
    await onboardEmployee(page);

    // Verify final state
    await page.goto('/hr/employees');
    await expect(page.locator('text=Jane Smith')).toBeVisible();
  });
});
```

---

## 6. API Testing

### 6.1 REST API Tests (Supertest)

```typescript
describe('HR API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get auth token
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'test123' });
    authToken = response.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /hr/employees', () => {
    it('should create employee with valid data', () => {
      return request(app.getHttpServer())
        .post('/hr/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+251912345678',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.firstName).toBe('John');
        });
    });

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/hr/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'invalid-email',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('email');
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .post('/hr/employees')
        .send({ firstName: 'John' })
        .expect(401);
    });
  });
});
```

---

## 7. Performance Testing

### 7.1 Load Testing (k6)

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 }, // Ramp up to 50 users
    { duration: '3m', target: 50 }, // Stay at 50 users
    { duration: '1m', target: 100 }, // Ramp up to 100 users
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'], // Error rate < 1%
  },
};

export default function () {
  const response = http.get('http://localhost:3000/api/hr/employees');

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

**Run load test:**

```bash
k6 run load-test.js
```

### 7.2 Database Query Performance

```typescript
describe('Performance Tests', () => {
  it('should fetch 1000 employees in under 1 second', async () => {
    const start = Date.now();
    const employees = await repository.find({ take: 1000 });
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000);
    expect(employees).toHaveLength(1000);
  });

  it('should handle concurrent requests', async () => {
    const requests = Array(50)
      .fill(null)
      .map(() => service.findAll({ limit: 100 }));

    const start = Date.now();
    await Promise.all(requests);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(5000); // 50 requests in < 5s
  });
});
```

---

## 8. Security Testing

### 8.1 Authentication Tests

```typescript
describe('Authentication Security', () => {
  it('should reject invalid JWT tokens', async () => {
    const response = await request(app)
      .get('/hr/employees')
      .set('Authorization', 'Bearer invalid_token')
      .expect(401);
  });

  it('should reject expired tokens', async () => {
    const expiredToken = generateExpiredToken();
    await request(app)
      .get('/hr/employees')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  it('should enforce rate limiting', async () => {
    const requests = Array(20)
      .fill(null)
      .map(() => request(app).post('/auth/login').send(validCredentials));

    const responses = await Promise.all(requests);
    const tooManyRequests = responses.filter((r) => r.status === 429);

    expect(tooManyRequests.length).toBeGreaterThan(0);
  });
});
```

### 8.2 Authorization Tests

```typescript
describe('Authorization', () => {
  it('should deny access without required permission', async () => {
    const userToken = await getTokenForUser('employee');

    await request(app)
      .delete('/hr/employees/123')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('should allow access with correct permission', async () => {
    const adminToken = await getTokenForUser('admin');

    await request(app)
      .delete('/hr/employees/123')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });
});
```

### 8.3 Input Validation Tests

```typescript
describe('Input Validation', () => {
  it('should prevent SQL injection', async () => {
    await request(app)
      .get('/hr/employees')
      .query({ email: "'; DROP TABLE employees; --" })
      .expect(400);
  });

  it('should prevent XSS attacks', async () => {
    const response = await request(app)
      .post('/hr/employees')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: '<script>alert("XSS")</script>',
        email: 'test@example.com',
      })
      .expect(400);
  });
});
```

---

## 9. Test Data Management

### 9.1 Test Data Builders

```typescript
// test/factories/employee.factory.ts
export class EmployeeFactory {
  static create(overrides?: Partial<Employee>): Employee {
    return {
      id: faker.string.uuid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: '+251912345678',
      status: 'ACTIVE',
      company_id: 'BLIH',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMany(count: number, overrides?: Partial<Employee>): Employee[] {
    return Array(count)
      .fill(null)
      .map(() => this.create(overrides));
  }
}

// Usage in tests
const employee = EmployeeFactory.create({ firstName: 'John' });
const employees = EmployeeFactory.createMany(10);
```

### 9.2 Database Seeding

```typescript
// database/seeds/test.seed.ts
export class TestDataSeeder {
  async run(dataSource: DataSource): Promise<void> {
    // Clean database
    await this.clean(dataSource);

    // Seed users
    await this.seedUsers(dataSource);

    // Seed employees
    await this.seedEmployees(dataSource);

    // Seed test data
    await this.seedTestData(dataSource);
  }

  private async clean(dataSource: DataSource): Promise<void> {
    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.clear();
    }
  }
}
```

---

## 10. CI/CD Integration

### 10.1 GitHub Actions Test Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:cov

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Run integration tests
        run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 11. Code Coverage

### 11.1 Jest Coverage Configuration

```javascript
// jest.config.js
module.exports = {
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
    '!src/main.ts',
  ],
  coverageThresholds: {
    global: {
      branches: 75,
      functions: 80,
      lines: 75,
      statements: 75,
    },
    './src/modules/hr/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

### 11.2 View Coverage Reports

```bash
# Generate coverage report
npm run test:cov

# Open HTML report
open coverage/lcov-report/index.html
```

---

## 12. Testing Checklist

### Before Commit

- [ ] All tests pass locally
- [ ] New features have tests
- [ ] Bug fixes have regression tests
- [ ] Code coverage thresholds met
- [ ] No console.log statements

### Before PR

- [ ] CI tests passing
- [ ] Integration tests pass
- [ ] E2E tests pass (critical paths)
- [ ] Security tests pass
- [ ] Performance benchmarks met

### Before Release

- [ ] Full regression test suite
- [ ] Load tests completed
- [ ] Security scan performed
- [ ] Browser compatibility tested
- [ ] Mobile responsiveness verified

---

**Last Updated:** February 2026  
**Maintained by:** QA Team
