# Hierarchical RBAC + Fine-Grained Permissions Guide

## THE ANSWER: HYBRID APPROACH

Use **both** Keycloak and your database — each for what it does best:

| Concern                                         | Where    | Why                                                           |
| ----------------------------------------------- | -------- | ------------------------------------------------------------- |
| **Authentication** (who are you?)               | Keycloak | Token issuance, login, SSO                                    |
| **High-level Roles** (what group?)              | Keycloak | `superadmin`, `hr`, `finance`, etc. — stored in JWT           |
| **Fine-grained Permissions** (what can you do?) | Database | `user:create`, `invoice:approve`, etc. — too granular for JWT |
| **Role-Permission Mapping**                     | Database | Which role gets which permissions — business logic            |
| **Sub-roles / Hierarchy**                       | Database | Inheritance logic is too complex for Keycloak alone           |

### Why Not Everything in Keycloak?

- Keycloak CAN do fine-grained authorization, but it becomes **very hard to maintain** with 50+ permissions
- JWTs get **bloated** if you stuff every permission into the token
- Permission changes require **Keycloak admin access**, not just a database update
- Your app's business logic (which roles inherit from which) belongs in **your domain**
- Keycloak's Authorization Services have a steep learning curve and are overkill for most apps

### Why Not Everything in the Database?

- You'd have to build login, token issuance, session management, SSO yourself
- Keycloak handles the security-critical parts (auth, token signing, brute force protection)

---

## PART 1: YOUR ROLE & PERMISSION ARCHITECTURE

### 1.1 Role Hierarchy

```
superadmin
├── hr
│   ├── hr_manager
│   └── hr_assistant
├── finance
│   ├── finance_manager
│   └── finance_accountant
├── project_manager
│   ├── pm_lead
│   └── pm_member
├── crm_manager
│   ├── crm_lead
│   └── crm_agent
└── brain_operator
    ├── brain_admin
    └── brain_viewer
```

### 1.2 Permission Format (Strict 2-Part Only)

Permissions use a **strict 2-part** format only: `resource:action`. No 3-part keys (e.g. `module:resource:action`) are supported; the system uses a single global resource namespace.

- **Exact:** `user:view`, `invoice:approve`
- **Wildcard action:** `user:*`, `invoice:*`
- **Global wildcard:** `*` (e.g. superadmin)

Resource names are globally unique and catalog-driven (see seed manifest). Effective permissions are resolved dynamically from roles + role-permissions + user overrides with in-memory caching in the application layer.

```
# User Management
user:view, user:create, user:update, user:disable, user:delete, user:assign-role

# Employee / HR
employee:view, employee:create, employee:update, employee:terminate
leave:view, leave:create, leave:approve, leave:reject
payroll:view, payroll:process, payroll:approve

# Finance
invoice:view, invoice:create, invoice:approve, invoice:void
expense:view, expense:create, expense:approve
report:view-financial, report:export-financial

# Project Management
project:view, project:create, project:update, project:delete, project:assign-member
task:view, task:create, task:update, task:assign

# CRM
contact:view, contact:create, contact:update, contact:delete
deal:view, deal:create, deal:update, deal:close
pipeline:view, pipeline:manage

# Brain / System
system:view-config, system:update-config, system:view-logs, system:manage-integrations
```

### 1.3 Role → Permission Mapping (Example)

```
superadmin      → ALL PERMISSIONS (wildcard *)

hr_manager      → user:view, user:create, user:update, user:disable
                  employee:*, leave:*, payroll:view, payroll:process

hr_assistant    → user:view, employee:view, employee:create
                  leave:view, leave:create

finance_manager → invoice:*, expense:*, report:*, payroll:approve

crm_agent       → contact:view, contact:create, contact:update
                  deal:view, deal:create, deal:update

brain_viewer    → system:view-config, system:view-logs
```

---

## PART 2: KEYCLOAK CONFIGURATION

Only store **top-level roles** in Keycloak. These go into the JWT token.

### 2.1 Create Realm Roles in Keycloak

Go to **Realm Roles** → Create each:

```
superadmin
hr
finance
project_manager
crm_manager
brain_operator
```

### 2.2 Create Composite Roles (for sub-roles)

Keycloak supports **composite roles** — a role that includes other roles.

Example: `hr` is a composite role containing `hr_manager` and `hr_assistant`.

1. Create the sub-roles first:
   - `hr_manager`
   - `hr_assistant`
   - `finance_manager`
   - `finance_accountant`
   - `pm_lead`
   - `pm_member`
   - `crm_lead`
   - `crm_agent`
   - `brain_admin`
   - `brain_viewer`

2. Make parent roles composite:
   - Go to `hr` role → **Action** → Enable **Composite**
   - Under **Associated Roles** → Add `hr_manager`, `hr_assistant`
   - Now anyone assigned `hr` automatically gets both sub-roles too

3. Make `superadmin` composite:
   - Add ALL other roles as associated roles
   - A superadmin automatically inherits every role

### 2.3 Assign Roles to Users

Go to **Users** → select user → **Role Mapping**:

- User "John" → assign `hr_manager`
- User "Jane" → assign `finance_manager`, `pm_lead`
- User "Boss" → assign `superadmin`

**The JWT will contain these roles in `realm_access.roles`.**

---

## PART 3: DATABASE SCHEMA (Permission System)

This is where the fine-grained permissions live.

### 3.1 Database Tables

```sql
-- Resources in your system
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,        -- 'user', 'employee', 'invoice'
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Actions that can be performed
CREATE TABLE actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,        -- 'view', 'create', 'update', 'delete', 'approve'
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Permissions = resource + action combination
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    action_id UUID REFERENCES actions(id) ON DELETE CASCADE,
    slug VARCHAR(100) UNIQUE NOT NULL,       -- 'user:create', 'invoice:approve'
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(resource_id, action_id)
);

-- Roles (mirrored from Keycloak, including sub-roles)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,        -- 'hr_manager', 'finance_accountant'
    display_name VARCHAR(100),
    parent_role_id UUID REFERENCES roles(id), -- for hierarchy
    is_system_role BOOLEAN DEFAULT FALSE,     -- can't be deleted
    created_at TIMESTAMP DEFAULT NOW()
);

-- Role ↔ Permission mapping (the core table)
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- Optional: Direct user-permission overrides
-- (e.g., give a specific user an extra permission beyond their role)
CREATE TABLE user_permission_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keycloak_user_id VARCHAR(255) NOT NULL,  -- Keycloak sub (user ID)
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    granted BOOLEAN DEFAULT TRUE,            -- TRUE = grant, FALSE = deny (explicit deny)
    reason VARCHAR(255),
    granted_by VARCHAR(255),                 -- who gave this override
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(keycloak_user_id, permission_id)
);
```

### 3.2 Seed Data

```sql
-- Resources
INSERT INTO resources (name, description) VALUES
('user', 'User management'),
('employee', 'Employee records'),
('leave', 'Leave management'),
('payroll', 'Payroll processing'),
('invoice', 'Invoice management'),
('expense', 'Expense management'),
('project', 'Project management'),
('task', 'Task management'),
('contact', 'CRM contacts'),
('deal', 'CRM deals'),
('pipeline', 'CRM pipelines'),
('system', 'System configuration');

-- Actions
INSERT INTO actions (name, description) VALUES
('view', 'View/read access'),
('create', 'Create new records'),
('update', 'Edit existing records'),
('delete', 'Permanently delete records'),
('disable', 'Soft disable/deactivate'),
('approve', 'Approve pending items'),
('reject', 'Reject pending items'),
('assign', 'Assign to users'),
('export', 'Export data'),
('manage', 'Full management access');

-- Permissions (generate combinations)
INSERT INTO permissions (resource_id, action_id, slug, description)
SELECT r.id, a.id, r.name || ':' || a.name, 'Can ' || a.name || ' ' || r.name
FROM resources r
CROSS JOIN actions a
WHERE (r.name, a.name) IN (
    ('user', 'view'), ('user', 'create'), ('user', 'update'),
    ('user', 'disable'), ('user', 'delete'), ('user', 'assign'),
    ('employee', 'view'), ('employee', 'create'), ('employee', 'update'), ('employee', 'disable'),
    ('leave', 'view'), ('leave', 'create'), ('leave', 'approve'), ('leave', 'reject'),
    ('payroll', 'view'), ('payroll', 'manage'), ('payroll', 'approve'),
    ('invoice', 'view'), ('invoice', 'create'), ('invoice', 'approve'), ('invoice', 'delete'),
    ('expense', 'view'), ('expense', 'create'), ('expense', 'approve'),
    ('project', 'view'), ('project', 'create'), ('project', 'update'),
    ('project', 'delete'), ('project', 'assign'),
    ('task', 'view'), ('task', 'create'), ('task', 'update'), ('task', 'assign'),
    ('contact', 'view'), ('contact', 'create'), ('contact', 'update'), ('contact', 'delete'),
    ('deal', 'view'), ('deal', 'create'), ('deal', 'update'), ('deal', 'manage'),
    ('pipeline', 'view'), ('pipeline', 'manage'),
    ('system', 'view'), ('system', 'update'), ('system', 'manage')
);

-- Roles (mirror Keycloak + hierarchy)
INSERT INTO roles (name, display_name, parent_role_id, is_system_role) VALUES
('superadmin', 'Super Administrator', NULL, TRUE),
('hr', 'Human Resources', NULL, FALSE),
('hr_manager', 'HR Manager', (SELECT id FROM roles WHERE name = 'hr'), FALSE),
('hr_assistant', 'HR Assistant', (SELECT id FROM roles WHERE name = 'hr'), FALSE),
('finance', 'Finance', NULL, FALSE),
('finance_manager', 'Finance Manager', (SELECT id FROM roles WHERE name = 'finance'), FALSE),
('finance_accountant', 'Finance Accountant', (SELECT id FROM roles WHERE name = 'finance'), FALSE),
('project_manager', 'Project Management', NULL, FALSE),
('pm_lead', 'PM Lead', (SELECT id FROM roles WHERE name = 'project_manager'), FALSE),
('pm_member', 'PM Member', (SELECT id FROM roles WHERE name = 'project_manager'), FALSE),
('crm_manager', 'CRM Management', NULL, FALSE),
('crm_lead', 'CRM Lead', (SELECT id FROM roles WHERE name = 'crm_manager'), FALSE),
('crm_agent', 'CRM Agent', (SELECT id FROM roles WHERE name = 'crm_manager'), FALSE),
('brain_operator', 'Brain Operator', NULL, FALSE),
('brain_admin', 'Brain Admin', (SELECT id FROM roles WHERE name = 'brain_operator'), FALSE),
('brain_viewer', 'Brain Viewer', (SELECT id FROM roles WHERE name = 'brain_operator'), FALSE);

-- Role-Permission mappings (example for hr_manager)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'hr_manager' AND p.slug IN (
    'user:view', 'user:create', 'user:update', 'user:disable',
    'employee:view', 'employee:create', 'employee:update', 'employee:disable',
    'leave:view', 'leave:create', 'leave:approve', 'leave:reject',
    'payroll:view', 'payroll:manage'
);

-- Role-Permission mappings (example for hr_assistant)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'hr_assistant' AND p.slug IN (
    'user:view', 'employee:view', 'employee:create',
    'leave:view', 'leave:create'
);
```

---

## PART 4: NESTJS IMPLEMENTATION

### 4.1 Permission Entities (TypeORM)

```typescript
// src/permissions/entities/resource.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Permission } from './permission.entity';

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ nullable: true, length: 255 })
  description: string;

  @OneToMany(() => Permission, (p) => p.resource)
  permissions: Permission[];

  @CreateDateColumn()
  createdAt: Date;
}
```

```typescript
// src/permissions/entities/action.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('actions')
export class Action {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ nullable: true, length: 255 })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

```typescript
// src/permissions/entities/permission.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Resource } from './resource.entity';
import { Action } from './action.entity';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Resource, (r) => r.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resource_id' })
  resource: Resource;

  @ManyToOne(() => Action, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'action_id' })
  action: Action;

  @Column({ unique: true, length: 100 })
  slug: string; // 'user:create'

  @Column({ nullable: true, length: 255 })
  description: string;

  @ManyToMany(() => Role, (r) => r.permissions)
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;
}
```

```typescript
// src/permissions/entities/role.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ name: 'display_name', nullable: true, length: 100 })
  displayName: string;

  @ManyToOne(() => Role, (r) => r.children, { nullable: true })
  @JoinColumn({ name: 'parent_role_id' })
  parent: Role;

  @OneToMany(() => Role, (r) => r.parent)
  children: Role[];

  @Column({ name: 'is_system_role', default: false })
  isSystemRole: boolean;

  @ManyToMany(() => Permission, (p) => p.roles, { eager: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'permission_id' },
  })
  permissions: Permission[];

  @CreateDateColumn()
  createdAt: Date;
}
```

```typescript
// src/permissions/entities/user-permission-override.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Permission } from './permission.entity';

@Entity('user_permission_overrides')
export class UserPermissionOverride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'keycloak_user_id', length: 255 })
  userId: string;

  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @Column({ default: true })
  granted: boolean; // true = grant, false = explicit deny

  @Column({ nullable: true, length: 255 })
  reason: string;

  @Column({ name: 'granted_by', nullable: true, length: 255 })
  grantedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

### 4.2 Permission Service

```typescript
// src/permissions/permissions.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserPermissionOverride } from './entities/user-permission-override.entity';

@Injectable()
export class PermissionsService {
  // In-memory cache for role→permissions (invalidate on changes)
  private cache = new Map<string, string[]>();
  private cacheTimestamp = 0;
  private readonly CACHE_TTL = 60_000; // 1 minute

  constructor(
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private permRepo: Repository<Permission>,
    @InjectRepository(UserPermissionOverride)
    private overrideRepo: Repository<UserPermissionOverride>,
  ) {}

  /**
   * Get all effective permissions for a user based on their Keycloak roles
   * + any user-specific overrides from the database.
   */
  async getUserPermissions(
    keycloakRoles: string[],
    userId: string,
  ): Promise<string[]> {
    // 1. Get permissions from all roles (including inherited via hierarchy)
    const allRoleNames = await this.resolveRoleHierarchy(keycloakRoles);
    const rolePermissions = await this.getPermissionsForRoles(allRoleNames);

    // 2. Check for superadmin wildcard
    if (allRoleNames.includes('superadmin')) {
      return ['*']; // Superadmin gets everything
    }

    // 3. Get user-specific overrides
    const overrides = await this.overrideRepo.find({
      where: { userId },
      relations: ['permission'],
    });

    // 4. Apply overrides
    const permSet = new Set(rolePermissions);
    for (const ov of overrides) {
      if (ov.granted) {
        permSet.add(ov.permission.slug);
      } else {
        permSet.delete(ov.permission.slug); // explicit deny
      }
    }

    return Array.from(permSet);
  }

  /**
   * Resolve role hierarchy — if user has 'hr', they also get
   * permissions from 'hr_manager', 'hr_assistant', etc.
   * But if user has 'hr_assistant', they only get that, not 'hr_manager'.
   */
  async resolveRoleHierarchy(roleNames: string[]): Promise<string[]> {
    const allRoles = new Set<string>(roleNames);

    const roles = await this.roleRepo.find({
      relations: ['children', 'children.children'],
    });

    const addChildren = (name: string) => {
      const role = roles.find((r) => r.name === name);
      if (role?.children) {
        for (const child of role.children) {
          allRoles.add(child.name);
          addChildren(child.name); // recursive
        }
      }
    };

    for (const name of roleNames) {
      addChildren(name);
    }

    return Array.from(allRoles);
  }

  /**
   * Get all permission slugs for a list of role names.
   */
  async getPermissionsForRoles(roleNames: string[]): Promise<string[]> {
    const roles = await this.roleRepo.find({
      where: { name: In(roleNames) },
      relations: ['permissions'],
    });

    const perms = new Set<string>();
    for (const role of roles) {
      for (const p of role.permissions) {
        perms.add(p.slug);
      }
    }
    return Array.from(perms);
  }

  /**
   * Check if a specific permission is granted.
   */
  hasPermission(userPermissions: string[], required: string): boolean {
    if (userPermissions.includes('*')) return true; // superadmin

    // Check exact match
    if (userPermissions.includes(required)) return true;

    // Check wildcard: 'user:*' matches 'user:create'
    const [resource] = required.split(':');
    if (userPermissions.includes(`${resource}:*`)) return true;

    return false;
  }

  // Clear cache when roles/permissions are updated
  invalidateCache() {
    this.cache.clear();
    this.cacheTimestamp = 0;
  }
}
```

---

### 4.3 Permission Guard

```typescript
// src/auth/guards/permissions.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionsService } from '../../permissions/permissions.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    if (!required || required.length === 0) return true;

    const { user } = ctx.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Not authenticated');

    // Fetch permissions from DB based on Keycloak roles
    const userPerms = await this.permissionsService.getUserPermissions(
      user.roles,
      user.userId,
    );

    // Attach to request for later use
    user.permissions = userPerms;

    // Check: user must have ALL required permissions
    const hasAll = required.every((perm) =>
      this.permissionsService.hasPermission(userPerms, perm),
    );

    if (!hasAll) {
      throw new ForbiddenException(
        `Missing permissions: ${required
          .filter((p) => !this.permissionsService.hasPermission(userPerms, p))
          .join(', ')}`,
      );
    }

    return true;
  }
}
```

---

### 4.4 Permission Decorator

```typescript
// src/auth/decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

// Require specific permissions
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
```

---

### 4.5 Register Permission Guard Globally

```typescript
// src/app.module.ts (updated)
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PermissionsModule } from './permissions/permissions.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { PermissionsGuard } from './auth/guards/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      // your database config
    }),
    AuthModule,
    PermissionsModule,
  ],
  providers: [
    // Order matters! JWT first → Roles → Permissions
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
```

---

### 4.6 Usage in Controllers

```typescript
// src/users/users.controller.ts
import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
export class UsersController {
  // Any authenticated user with 'user:view' permission
  @RequirePermissions('user:view')
  @Get()
  findAll(@CurrentUser() user: any) {
    return { message: 'List of users', requestedBy: user.username };
  }

  // Requires both permissions
  @RequirePermissions('user:view', 'user:create')
  @Post()
  create(@Body() body: any) {
    return { message: 'User created' };
  }

  // Role + Permission combined
  @Roles('hr', 'hr_manager')
  @RequirePermissions('user:update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return { message: `User ${id} updated` };
  }

  // Only superadmin or users with user:disable
  @RequirePermissions('user:disable')
  @Patch(':id/disable')
  disable(@Param('id') id: string) {
    return { message: `User ${id} disabled` };
  }
}

// src/invoices/invoices.controller.ts
@Controller('invoices')
export class InvoicesController {
  @RequirePermissions('invoice:view')
  @Get()
  findAll() {
    return { invoices: [] };
  }

  @RequirePermissions('invoice:create')
  @Post()
  create(@Body() body: any) {
    return { message: 'Invoice created' };
  }

  @RequirePermissions('invoice:approve')
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return { message: `Invoice ${id} approved` };
  }
}
```

---

### 4.7 Permission Management API (for Superadmin UI)

```typescript
// src/permissions/permissions.controller.ts
import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsService } from './permissions.service';

@Controller('admin/permissions')
@Roles('superadmin') // Only superadmin can manage permissions
export class PermissionsController {
  constructor(private permsService: PermissionsService) {}

  // List all roles with their permissions
  @Get('roles')
  async listRoles() {
    return this.permsService.getAllRolesWithPermissions();
  }

  // List all available permissions
  @Get()
  async listPermissions() {
    return this.permsService.getAllPermissions();
  }

  // Assign permission to role
  @Post('roles/:roleName/permissions')
  async assignPermission(
    @Param('roleName') roleName: string,
    @Body() body: { permissionSlug: string },
  ) {
    await this.permsService.assignPermissionToRole(
      roleName,
      body.permissionSlug,
    );
    this.permsService.invalidateCache();
    return {
      message: `Permission ${body.permissionSlug} assigned to ${roleName}`,
    };
  }

  // Remove permission from role
  @Delete('roles/:roleName/permissions/:permissionSlug')
  async removePermission(
    @Param('roleName') roleName: string,
    @Param('permissionSlug') permSlug: string,
  ) {
    await this.permsService.removePermissionFromRole(roleName, permSlug);
    this.permsService.invalidateCache();
    return { message: `Permission ${permSlug} removed from ${roleName}` };
  }

  // Override: Grant/deny specific permission to a user
  @Post('users/:userId/overrides')
  async addOverride(
    @Param('userId') userId: string,
    @Body() body: { permissionSlug: string; granted: boolean; reason?: string },
  ) {
    return this.permsService.addUserOverride(userId, body);
  }

  // Get effective permissions for a user (for debugging)
  @Get('users/:userId/effective')
  async getEffective(@Param('userId') userId: string) {
    // Need to know their roles — could fetch from Keycloak Admin API
    return { message: 'Implement with Keycloak Admin API call' };
  }
}
```

---

## PART 5: HOW THE FULL FLOW WORKS

```
┌──────────────────────────────────────────────────────────────┐
│                        REQUEST FLOW                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User logs in via NextJS → Keycloak                       │
│     → Gets JWT with roles: ["hr_manager"]                    │
│                                                              │
│  2. Frontend calls: PATCH /api/users/123                     │
│     → Header: Authorization: Bearer <jwt>                    │
│                                                              │
│  3. JwtAuthGuard validates JWT signature via JWKS             │
│     → Extracts: { userId, roles: ["hr_manager"], ... }       │
│                                                              │
│  4. RolesGuard checks @Roles() if present                    │
│     → (optional layer, skip if only using permissions)       │
│                                                              │
│  5. PermissionsGuard sees @RequirePermissions('user:update') │
│     → Calls PermissionsService.getUserPermissions()          │
│     → DB lookup: hr_manager → [user:view, user:create,       │
│        user:update, user:disable, employee:view, ...]        │
│     → Checks: does list include 'user:update'? → YES ✅      │
│                                                              │
│  6. Controller method executes                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## PART 6: BEST PRACTICES & TIPS

### Caching

- Cache role→permissions mapping in Redis or in-memory
- Invalidate cache when superadmin changes permissions
- JWT roles don't change until token expires (5 min default)

### Performance

- The DB query in PermissionsGuard runs on every request
- Use caching (Redis recommended) to avoid repeated queries
- Consider loading permissions once per request via middleware

### Permission Naming Convention

- **Strict 2-part only:** Use `resource:action` format; 3-part keys (e.g. `module:resource:action`) are rejected.
- Resources are globally unique, catalog-driven names (e.g. `user`, `invoice`, `system_config`, `system_audit`).
- Actions are **verbs**: view, create, update, delete, approve, manage, export

### Syncing Roles

- Keep Keycloak roles and database roles in sync
- Write a seed/migration script to ensure database roles match Keycloak
- Use the Keycloak Admin API to programmatically sync

### Frontend Integration

- After login, call `GET /api/auth/me` which returns user profile + permissions
- Use permissions in frontend to show/hide UI elements
- **Never trust frontend-only permission checks** — always enforce on backend

```typescript
// Example: /api/auth/me endpoint
@Get('auth/me')
async getMe(@CurrentUser() user: any) {
  const permissions = await this.permsService.getUserPermissions(
    user.roles,
    user.userId,
  );
  return {
    ...user,
    permissions,
  };
}
```
