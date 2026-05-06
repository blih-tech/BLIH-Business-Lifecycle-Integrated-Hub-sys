import 'dotenv/config';
import {
  RBAC_PERMISSIONS,
  RBAC_RESOURCE_CATALOG,
  RBAC_ROLES,
} from '@repo/types/rbac';
import { createPrismaPgAdapter } from '../src/prisma-adapter.js';
import { PrismaClient } from '../src/prisma-client.js';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  superadmin: ['*'],
  hr: [
    // Core employee & org management
    'employee:*',
    'department:*',
    'position:*',
    'job_grade:*',
    // User account management
    'user:*',
    'user_profile:*',
    'user_employment:*',
    'user_compensation:*',
    'user_lifecycle:*',
    // Leave & attendance
    'leave:*',
    'attendance:*',
    'attendance_correction:*',
    'overtime:*',
    'flex_work:*',
    'punctuality:*',
    'timesheet:*',
    'attendance_report:*',
    // Recruitment
    'job:*',
    'job_approval:*',
    'candidate:*',
    'applicant:*',
    'job_application:*',
    'interview:*',
    'offer:*',
    // Onboarding & probation
    'onboarding:*',
    'onboarding_task:*',
    'onboarding_checklist:*',
    'asset_provisioning:*',
    'policy_acknowledgement:*',
    'probation_plan:*',
    'probation_kpi:*',
    'probation_evaluation:*',
    'probation_confirmation:*',
    // Performance & OKR
    'performance:*',
    'okr:*',
    // Training & skills
    'training:*',
    'training_feedback:*',
    'training_analytics:*',
    'certification:*',
    'training_compliance:*',
    // Career & talent
    'career_development:*',
    'internal_transfer:*',
    'salary_adjustment:*',
    'succession_plan:*',
    'promotion_proposal:*',
    // Employee relations & offboarding
    'relations:*',
    'offboarding:*',
  ],
  hr_manager: [
    // Core employee & org management
    'employee:*',
    'department:*',
    'position:*',
    'job_grade:*',
    // User account management
    'user:*',
    'user_profile:*',
    'user_employment:*',
    'user_compensation:*',
    'user_lifecycle:*',
    // Leave & attendance
    'leave:*',
    'attendance:*',
    'attendance_correction:*',
    'overtime:*',
    'flex_work:*',
    'punctuality:*',
    'timesheet:*',
    'attendance_report:*',
    // Recruitment
    'job:*',
    'job_approval:*',
    'candidate:*',
    'applicant:*',
    'job_application:*',
    'interview:*',
    'offer:*',
    // Onboarding & probation
    'onboarding:*',
    'onboarding_task:*',
    'onboarding_checklist:*',
    'asset_provisioning:*',
    'policy_acknowledgement:*',
    'probation_plan:*',
    'probation_kpi:*',
    'probation_evaluation:*',
    'probation_confirmation:*',
    // Performance & OKR
    'performance:*',
    'okr:*',
    // Training & skills
    'training:*',
    'training_feedback:*',
    'training_analytics:*',
    'certification:*',
    'training_compliance:*',
    // Career & talent
    'career_development:*',
    'internal_transfer:*',
    'salary_adjustment:*',
    'succession_plan:*',
    'promotion_proposal:*',
    // Employee relations & offboarding
    'relations:*',
    'offboarding:*',
  ],
  hr_assistant: [
    'employee:view',
    'employee:create',
    'leave:view',
    'leave:create',
    'attendance:view',
    'attendance_correction:view',
    'overtime:view',
    'user_profile:view',
    'user_profile:update',
    'department:view',
    'position:view',
  ],
  finance: ['finance_*:*'],
  finance_manager: ['*_report:*', 'expense:*', 'invoice:*'],
  finance_accountant: [
    'expense:view',
    'expense:create',
    'invoice:view',
    'invoice:create',
  ],
  project_manager: ['project:*', 'task:*'],
  pm_lead: ['project:*', 'task:*'],
  pm_member: ['project:view', 'task:create', 'task:update'],
  crm_manager: ['crm_client:*', 'deal:*', 'pipeline:*'],
  crm_lead: ['crm_client:*', 'deal:*', 'pipeline:*'],
  crm_agent: [
    'crm_client:view',
    'crm_client:create',
    'deal:view',
    'deal:create',
  ],
  brain_operator: ['brain_config:*'],
  brain_admin: ['brain_config:*'],
  brain_viewer: ['brain_config:view'],
};

const getRequiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const parseOptionalInt = (value: string | undefined, name: string) => {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid integer environment variable: ${name}`);
  }

  return parsed;
};

const { adapter, pool } = createPrismaPgAdapter({
  connectionString: getRequiredEnv('DATABASE_URL'),
  max: parseOptionalInt(
    process.env['DATABASE_POOL_SIZE'],
    'DATABASE_POOL_SIZE',
  ),
  connectionTimeoutMillis: parseOptionalInt(
    process.env['DATABASE_TIMEOUT_MS'],
    'DATABASE_TIMEOUT_MS',
  ),
  idleTimeoutMillis: parseOptionalInt(
    process.env['DATABASE_IDLE_TIMEOUT_MS'],
    'DATABASE_IDLE_TIMEOUT_MS',
  ),
});

const prisma = new PrismaClient({ adapter });

const PERMISSION_PATTERN = /^[a-z0-9_]+:[a-z0-9_*-]+$/;

const parsePermissionSlug = (slug: string) => {
  const normalized = slug.trim().toLowerCase();
  const [resource, action, extra] = normalized.split(':');
  if (!resource || !action || extra || !PERMISSION_PATTERN.test(normalized)) {
    throw new Error(`Invalid permission slug: ${slug}`);
  }
  return { resource, action, slug: normalized };
};

const ensureCatalogConsistency = () => {
  const resourceSet = new Set(RBAC_RESOURCE_CATALOG.map((entry) => entry.name));
  const unknownResourceNames = [
    ...new Set(
      RBAC_PERMISSIONS.map((slug) => parsePermissionSlug(slug).resource),
    ),
  ].filter((resourceName) => !resourceSet.has(resourceName));

  if (unknownResourceNames.length > 0) {
    throw new Error(
      `Permissions reference unknown resources: ${unknownResourceNames.join(', ')}`,
    );
  }
};

const ensureCatalog = async (): Promise<Map<string, string>> => {
  for (const resource of RBAC_RESOURCE_CATALOG) {
    await prisma.permissionResource.upsert({
      where: { name: resource.name },
      update: {
        description: resource.description,
      },
      create: {
        name: resource.name,
        description: resource.description,
      },
    });
  }

  const resources = await prisma.permissionResource.findMany({
    select: { id: true, name: true },
  });

  return new Map<string, string>(
    resources.map((entry) => [entry.name, entry.id]),
  );
};

const ensurePermissions = async (resourceIdByName: Map<string, string>) => {
  const actions = [
    ...new Set(
      RBAC_PERMISSIONS.map((slug) => parsePermissionSlug(slug).action),
    ),
  ];

  for (const action of actions) {
    await prisma.permissionAction.upsert({
      where: { name: action },
      update: {},
      create: { name: action },
    });
  }

  const actionIdByName = new Map<string, string>(
    (
      await prisma.permissionAction.findMany({
        select: { id: true, name: true },
      })
    ).map((entry) => [entry.name, entry.id]),
  );

  for (const slug of RBAC_PERMISSIONS) {
    const parsed = parsePermissionSlug(slug);
    const resourceId = resourceIdByName.get(parsed.resource);
    const actionId = actionIdByName.get(parsed.action);

    if (!resourceId || !actionId) {
      throw new Error(`Missing resource/action mapping for ${slug}`);
    }

    await prisma.permission.upsert({
      where: { slug: parsed.slug },
      update: {
        resourceId,
        actionId,
      },
      create: {
        resourceId,
        actionId,
        slug: parsed.slug,
      },
    });
  }
};

const ensureRoles = async () => {
  const roleIdByName = new Map<string, string>();

  for (const role of RBAC_ROLES) {
    const record = await prisma.role.upsert({
      where: { name: role.name },
      update: {
        displayName: role.displayName,
        description: role.description,
        isSystem: role.isSystem,
      },
      create: {
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        isSystem: role.isSystem,
      },
      select: {
        id: true,
      },
    });

    roleIdByName.set(role.name, record.id);
  }

  for (const role of RBAC_ROLES) {
    const parentRoleId = role.parentRoleName
      ? (roleIdByName.get(role.parentRoleName) ?? null)
      : null;

    await prisma.role.update({
      where: { name: role.name },
      data: { parentRoleId },
    });
  }
};

const ensureRolePermissions = async () => {
  const permissions = await prisma.permission.findMany({
    select: { id: true, slug: true },
  });
  const permissionIdBySlug = new Map<string, string>(
    permissions.map((p) => [p.slug, p.id]),
  );

  const roles = await prisma.role.findMany({
    select: { id: true, name: true },
  });
  const roleIdByName = new Map<string, string>(
    roles.map((r) => [r.name, r.id]),
  );

  const allPerms = Array.from(permissionIdBySlug.keys());

  const matchPattern = (slug: string, pattern: string): boolean => {
    if (pattern === '*') return true;
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(slug);
    }
    return slug === pattern;
  };

  for (const [roleName, permPatterns] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleIdByName.get(roleName);
    if (!roleId) {
      console.warn(`Role not found: ${roleName}`);
      continue;
    }

    for (const pattern of permPatterns) {
      const matchingPerms = allPerms.filter((slug) =>
        matchPattern(slug, pattern),
      );

      if (matchingPerms.length === 0) {
        console.warn(`No permissions match pattern: ${pattern}`);
        continue;
      }

      for (const slug of matchingPerms) {
        const permId = permissionIdBySlug.get(slug);
        if (!permId) continue;

        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId,
              permissionId: permId,
            },
          },
          update: {},
          create: {
            roleId,
            permissionId: permId,
          },
        });
      }
    }
  }
};

async function main(): Promise<void> {
  ensureCatalogConsistency();

  const resourceIdByName = await ensureCatalog();
  await ensurePermissions(resourceIdByName);
  await ensureRoles();
  await ensureRolePermissions();

  await prisma.moduleConfig.upsert({
    where: { module: 'core' },
    update: {},
    create: {
      module: 'core',
      enabled: true,
    },
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
