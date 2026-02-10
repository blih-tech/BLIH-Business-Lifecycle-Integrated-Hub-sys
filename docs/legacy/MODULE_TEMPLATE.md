# BLIH Module Template

This document shows the exact structure and code patterns for building a BLIH module. Use this as a template when creating new modules.

## Module Structure

```
module-example/
├── backend/
│   ├── src/
│   │   ├── example.module.ts          # Main NestJS module
│   │   ├── example.controller.ts      # REST API endpoints
│   │   ├── example.service.ts         # Business logic
│   │   ├── entities/                  # MongoDB/PostgreSQL entities
│   │   │   └── example.entity.ts
│   │   ├── dto/                       # Data transfer objects
│   │   │   ├── create-example.dto.ts
│   │   │   └── update-example.dto.ts
│   │   ├── events/                    # Event handling
│   │   │   ├── example.events.ts     # Event definitions
│   │   │   └── example.event-handler.ts # Event subscribers
│   │   ├── permissions/               # RBAC permissions
│   │   │   └── example.permissions.ts
│   │   └── guards/                    # Custom guards (if needed)
│   ├── test/
│   │   └── example.service.spec.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   └── example/
│   │       ├── page.tsx               # List view
│   │       ├── [id]/
│   │       │   └── page.tsx          # Detail view
│   │       └── new/
│   │           └── page.tsx          # Create form
│   ├── components/
│   │   ├── ExampleList.tsx
│   │   └── ExampleForm.tsx
│   └── lib/
│       └── example-api.ts            # API client
│
├── database/
│   ├── migrations/                    # Database migrations
│   │   └── 001-initial-schema.ts
│   └── seeds/                        # Seed data (optional)
│       └── example-seed.ts
│
├── events/
│   └── example-events.ts             # Shared event types
│
├── permissions/
│   └── example-permissions.ts        # Permission definitions
│
└── docs/
    └── api.md                        # API documentation
```

---

## Step-by-Step Implementation

### Step 1: Define Permissions

```typescript
// module-example/backend/src/permissions/example.permissions.ts
export const EXAMPLE_PERMISSIONS = {
  VIEW: 'EXAMPLE:resource:view',
  CREATE: 'EXAMPLE:resource:create',
  EDIT: 'EXAMPLE:resource:edit',
  DELETE: 'EXAMPLE:resource:delete',
  APPROVE: 'EXAMPLE:resource:approve', // If needed
} as const;

export type ExamplePermission = typeof EXAMPLE_PERMISSIONS[keyof typeof EXAMPLE_PERMISSIONS];
```

**Also add to shared package:**
```typescript
// packages/shared/permissions/all-permissions.ts
import { EXAMPLE_PERMISSIONS } from '../../module-example/backend/src/permissions/example.permissions';

export const ALL_PERMISSIONS = {
  ...EXAMPLE_PERMISSIONS,
  // ... other module permissions
} as const;
```

---

### Step 2: Create Entity (MongoDB Example)

```typescript
// module-example/backend/src/entities/example.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExampleDocument = Example & Document;

@Schema({ timestamps: true })
export class Example {
  @Prop({ required: true })
  companyId: string; // Always "BLIH" (single-company)

  @Prop({ required: true, unique: true })
  exampleId: string; // e.g., "EX-001"

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ enum: ['draft', 'active', 'archived'], default: 'draft' })
  status: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  // Soft delete
  @Prop({ default: false })
  deleted: boolean;
}

export const ExampleSchema = SchemaFactory.createForClass(Example);

// Indexes for performance
ExampleSchema.index({ companyId: 1, exampleId: 1 });
ExampleSchema.index({ status: 1 });
ExampleSchema.index({ deleted: 1 });
```

**For PostgreSQL (Finance module):**
```typescript
// module-finance/backend/src/entities/transaction.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string; // Always "BLIH"

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column()
  account: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

### Step 3: Create DTOs

```typescript
// module-example/backend/src/dto/create-example.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateExampleDto {
  @IsString()
  @IsNotEmpty()
  exampleId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['draft', 'active', 'archived'])
  @IsOptional()
  status?: string;
}
```

```typescript
// module-example/backend/src/dto/update-example.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateExampleDto } from './create-example.dto';

export class UpdateExampleDto extends PartialType(CreateExampleDto) {}
```

---

### Step 4: Create Service (Business Logic)

```typescript
// module-example/backend/src/example.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Example, ExampleDocument } from './entities/example.entity';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
import { AuditService } from '@core-platform/audit/audit.service';
import { ExampleCreatedEvent } from './events/example.events';

@Injectable()
export class ExampleService {
  private readonly companyId = 'BLIH'; // Single company

  constructor(
    @InjectModel(Example.name) private exampleModel: Model<ExampleDocument>,
    private eventEmitter: EventEmitter2,
    private auditService: AuditService,
  ) {}

  async create(createDto: CreateExampleDto, userId: string): Promise<Example> {
    // Enforce company_id
    const example = await this.exampleModel.create({
      ...createDto,
      companyId: this.companyId,
    });

    // Publish event
    this.eventEmitter.emit(
      'example.created',
      new ExampleCreatedEvent(example.id, this.companyId),
    );

    // Audit log
    await this.auditService.log({
      userId,
      module: 'EXAMPLE',
      action: 'resource.created',
      resourceId: example.id,
      metadata: { exampleId: example.exampleId },
    });

    return example;
  }

  async findAll(userId: string): Promise<Example[]> {
    // Always filter by company_id
    return this.exampleModel.find({
      companyId: this.companyId,
      deleted: false,
    });
  }

  async findOne(id: string, userId: string): Promise<Example> {
    const example = await this.exampleModel.findOne({
      _id: id,
      companyId: this.companyId,
      deleted: false,
    });

    if (!example) {
      throw new NotFoundException('Example not found');
    }

    return example;
  }

  async update(
    id: string,
    updateDto: UpdateExampleDto,
    userId: string,
  ): Promise<Example> {
    const example = await this.findOne(id, userId);

    Object.assign(example, updateDto);
    await example.save();

    // Audit log
    await this.auditService.log({
      userId,
      module: 'EXAMPLE',
      action: 'resource.updated',
      resourceId: id,
      metadata: updateDto,
    });

    return example;
  }

  async remove(id: string, userId: string): Promise<void> {
    // Soft delete
    await this.exampleModel.updateOne(
      { _id: id, companyId: this.companyId },
      { deleted: true },
    );

    // Audit log
    await this.auditService.log({
      userId,
      module: 'EXAMPLE',
      action: 'resource.deleted',
      resourceId: id,
    });
  }
}
```

---

### Step 5: Create Controller (REST API)

```typescript
// module-example/backend/src/example.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExampleService } from './example.service';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
import { JwtAuthGuard } from '@core-platform/auth/jwt-auth.guard';
import { PermissionsGuard } from '@core-platform/permissions/permissions.guard';
import { RequirePermission } from '@core-platform/permissions/permissions.decorator';
import { EXAMPLE_PERMISSIONS } from './permissions/example.permissions';

@Controller('example')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  @RequirePermission(EXAMPLE_PERMISSIONS.CREATE)
  create(@Body() createDto: CreateExampleDto, @Request() req) {
    return this.exampleService.create(createDto, req.user.id);
  }

  @Get()
  @RequirePermission(EXAMPLE_PERMISSIONS.VIEW)
  findAll(@Request() req) {
    return this.exampleService.findAll(req.user.id);
  }

  @Get(':id')
  @RequirePermission(EXAMPLE_PERMISSIONS.VIEW)
  findOne(@Param('id') id: string, @Request() req) {
    return this.exampleService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @RequirePermission(EXAMPLE_PERMISSIONS.EDIT)
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateExampleDto,
    @Request() req,
  ) {
    return this.exampleService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @RequirePermission(EXAMPLE_PERMISSIONS.DELETE)
  remove(@Param('id') id: string, @Request() req) {
    return this.exampleService.remove(id, req.user.id);
  }
}
```

---

### Step 6: Create Module Definition

```typescript
// module-example/backend/src/example.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExampleController } from './example.controller';
import { ExampleService } from './example.service';
import { Example, ExampleSchema } from './entities/example.entity';
import { AuditModule } from '@core-platform/audit/audit.module';
import { ExampleEventHandler } from './events/example.event-handler';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Example.name, schema: ExampleSchema }]),
    AuditModule,
  ],
  controllers: [ExampleController],
  providers: [ExampleService, ExampleEventHandler],
  exports: [ExampleService], // If other modules need it
})
export class ExampleModule {}
```

---

### Step 7: Define Events

```typescript
// module-example/backend/src/events/example.events.ts
export class ExampleCreatedEvent {
  constructor(
    public readonly exampleId: string,
    public readonly companyId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class ExampleUpdatedEvent {
  constructor(
    public readonly exampleId: string,
    public readonly companyId: string,
    public readonly changes: Record<string, any>,
  ) {}
}

export class ExampleDeletedEvent {
  constructor(
    public readonly exampleId: string,
    public readonly companyId: string,
  ) {}
}
```

**Add to shared events:**
```typescript
// packages/shared/events/index.ts
export * from '../../module-example/backend/src/events/example.events';
```

---

### Step 8: Create Event Handler (Subscriber)

```typescript
// module-example/backend/src/events/example.event-handler.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ExampleCreatedEvent } from './example.events';
import { BrainService } from '@module-brain/brain.service'; // If Brain observes

@Injectable()
export class ExampleEventHandler {
  constructor(private brainService: BrainService) {}

  @OnEvent('example.created')
  async handleExampleCreated(event: ExampleCreatedEvent) {
    // Example: Brain module observes and stores pattern
    await this.brainService.recordEvent({
      type: 'example.created',
      module: 'EXAMPLE',
      resourceId: event.exampleId,
      timestamp: event.timestamp,
    });
  }
}
```

**For subscribing to OTHER modules' events:**
```typescript
// module-example/backend/src/events/example.event-handler.ts
import { OnEvent } from '@nestjs/event-emitter';
import { DealWonEvent } from '@module-crm/events/crm.events';

@OnEvent('crm.deal.won')
async handleDealWon(event: DealWonEvent) {
  // React to deal won event
  // e.g., create example resource from deal
}
```

---

### Step 9: Frontend API Client

```typescript
// module-example/frontend/lib/example-api.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Example {
  id: string;
  exampleId: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExampleDto {
  exampleId: string;
  name: string;
  description?: string;
  status?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export const exampleApi = {
  list: async (): Promise<Example[]> => {
    const res = await fetch(`${API_BASE}/example`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch examples');
    return res.json();
  },

  get: async (id: string): Promise<Example> => {
    const res = await fetch(`${API_BASE}/example/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch example');
    return res.json();
  },

  create: async (data: CreateExampleDto): Promise<Example> => {
    const res = await fetch(`${API_BASE}/example`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create example');
    }
    return res.json();
  },

  update: async (id: string, data: Partial<CreateExampleDto>): Promise<Example> => {
    const res = await fetch(`${API_BASE}/example/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update example');
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/example/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete example');
  },
};

// React Hooks
export const useExamples = () => {
  return useQuery({
    queryKey: ['examples'],
    queryFn: exampleApi.list,
  });
};

export const useExample = (id: string) => {
  return useQuery({
    queryKey: ['examples', id],
    queryFn: () => exampleApi.get(id),
    enabled: !!id,
  });
};

export const useCreateExample = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: exampleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examples'] });
    },
  });
};

export const useUpdateExample = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateExampleDto> }) =>
      exampleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examples'] });
    },
  });
};

export const useDeleteExample = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: exampleApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examples'] });
    },
  });
};
```

---

### Step 10: Frontend Components

```typescript
// module-example/frontend/components/ExampleList.tsx
'use client';

import { useExamples, useDeleteExample } from '../lib/example-api';
import { PermissionGate } from '@shared/components/PermissionGate';
import { EXAMPLE_PERMISSIONS } from '@shared/permissions';
import Link from 'next/link';

export function ExampleList() {
  const { data: examples, isLoading, error } = useExamples();
  const deleteMutation = useDeleteExample();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>Examples</h1>
        <PermissionGate permission={EXAMPLE_PERMISSIONS.CREATE}>
          <Link href="/example/new" className="btn btn-primary">
            Create Example
          </Link>
        </PermissionGate>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {examples?.map((example) => (
            <tr key={example.id}>
              <td>{example.exampleId}</td>
              <td>{example.name}</td>
              <td>{example.status}</td>
              <td>
                <Link href={`/example/${example.id}`}>View</Link>
                <PermissionGate permission={EXAMPLE_PERMISSIONS.DELETE}>
                  <button
                    onClick={() => deleteMutation.mutate(example.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </button>
                </PermissionGate>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

```typescript
// module-example/frontend/components/ExampleForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateExample, useUpdateExample } from '../lib/example-api';
import { useRouter } from 'next/navigation';

const exampleSchema = z.object({
  exampleId: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

type ExampleFormData = z.infer<typeof exampleSchema>;

export function ExampleForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const createMutation = useCreateExample();
  const updateMutation = useUpdateExample();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExampleFormData>({
    resolver: zodResolver(exampleSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: ExampleFormData) => {
    try {
      if (initialData?.id) {
        await updateMutation.mutateAsync({ id: initialData.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      router.push('/example');
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Example ID</label>
        <input {...register('exampleId')} />
        {errors.exampleId && <span>{errors.exampleId.message}</span>}
      </div>

      <div>
        <label>Name</label>
        <input {...register('name')} />
        {errors.name && <span>{errors.name.message}</span>}
      </div>

      <div>
        <label>Description</label>
        <textarea {...register('description')} />
      </div>

      <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
        {initialData ? 'Update' : 'Create'}
      </button>
    </form>
  );
}
```

---

### Step 11: Frontend Pages

```typescript
// module-example/frontend/app/example/page.tsx
import { ExampleList } from '../components/ExampleList';

export default function ExamplePage() {
  return <ExampleList />;
}
```

```typescript
// module-example/frontend/app/example/new/page.tsx
import { ExampleForm } from '../components/ExampleForm';

export default function NewExamplePage() {
  return (
    <div>
      <h1>Create Example</h1>
      <ExampleForm />
    </div>
  );
}
```

```typescript
// module-example/frontend/app/example/[id]/page.tsx
import { useExample } from '../../lib/example-api';
import { ExampleForm } from '../../components/ExampleForm';
import { use } from 'react';

export default function ExampleDetailPage({ params }: { params: { id: string } }) {
  const { id } = use(params);
  const { data: example, isLoading } = useExample(id);

  if (isLoading) return <div>Loading...</div>;
  if (!example) return <div>Not found</div>;

  return (
    <div>
      <h1>Edit Example</h1>
      <ExampleForm initialData={example} />
    </div>
  );
}
```

---

### Step 12: Register Module in Main App

```typescript
// packages/core-platform/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ExampleModule } from '@module-example/example.module';
// ... other modules

@Module({
  imports: [
    CorePlatformModule,
    ExampleModule,
    // ... other modules
  ],
})
export class AppModule {}
```

---

## Testing Example

```typescript
// module-example/backend/src/example.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExampleService } from './example.service';
import { Example } from './entities/example.entity';

describe('ExampleService', () => {
  let service: ExampleService;
  let mockModel: any;
  let mockEventEmitter: any;

  beforeEach(async () => {
    mockModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExampleService,
        {
          provide: getModelToken(Example.name),
          useValue: mockModel,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: 'AuditService',
          useValue: { log: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ExampleService>(ExampleService);
  });

  it('should create example and emit event', async () => {
    const createDto = { exampleId: 'EX-001', name: 'Test' };
    const savedExample = { ...createDto, id: '123', companyId: 'BLIH' };

    mockModel.create.mockResolvedValue(savedExample);

    const result = await service.create(createDto, 'user-123');

    expect(result).toEqual(savedExample);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      'example.created',
      expect.any(Object),
    );
  });
});
```

---

## Checklist for New Module

- [ ] Permissions defined
- [ ] Entity/schema created
- [ ] DTOs created
- [ ] Service implemented (CRUD + events + audit)
- [ ] Controller implemented (with RBAC guards)
- [ ] Module registered
- [ ] Events defined and published
- [ ] Event handlers created (if subscribing)
- [ ] Frontend API client created
- [ ] Frontend components created
- [ ] Frontend pages created
- [ ] Unit tests written
- [ ] Integration tested
- [ ] Documentation updated

---

## Common Patterns

### Pattern 1: Workflow with Approval

```typescript
// In service
async approve(id: string, userId: string) {
  const example = await this.findOne(id, userId);
  
  if (example.status !== 'pending') {
    throw new BadRequestException('Only pending items can be approved');
  }

  example.status = 'approved';
  await example.save();

  // Publish event
  this.eventEmitter.emit('example.approved', new ExampleApprovedEvent(id));

  // Audit
  await this.auditService.log({
    userId,
    module: 'EXAMPLE',
    action: 'resource.approved',
    resourceId: id,
  });

  return example;
}
```

### Pattern 2: Company ID Enforcement

```typescript
// Always filter by companyId
async findAll() {
  return this.model.find({
    companyId: 'BLIH', // Single company
    deleted: false,
  });
}
```

### Pattern 3: Soft Delete

```typescript
async remove(id: string) {
  // Don't actually delete, mark as deleted
  await this.model.updateOne(
    { _id: id, companyId: 'BLIH' },
    { deleted: true },
  );
}
```

---

**Use this template as a starting point for every new module!**



