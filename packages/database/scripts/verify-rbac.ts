#!/usr/bin/env node
/**
 * RBAC Verification and Fix Script
 * 
 * This script verifies that role-permission mappings are correctly configured
 * in the database and fixes any missing mappings.
 */

import 'dotenv/config';
import { createPrismaPgAdapter } from '../src/prisma-adapter.js';
import { PrismaClient } from '../src/prisma-client.js';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  superadmin: ['*'],
  hr: [
    'employee:*', 'department:*', 'position:*', 'job_grade:*',
    'user:*', 'user_profile:*', 'user_employment:*', 'user_compensation:*', 'user_lifecycle:*',
    'leave:*', 'attendance:*', 'attendance_correction:*', 'overtime:*', 'flex_work:*',
    'punctuality:*', 'timesheet:*', 'attendance_report:*', 'hr_payroll:*',
    'job:*', 'job_approval:*', 'candidate:*', 'applicant:*', 'job_application:*', 'interview:*', 'offer:*',
    'onboarding:*', 'onboarding_task:*', 'onboarding_checklist:*', 'asset_provisioning:*',
    'policy_acknowledgement:*', 'probation_plan:*', 'probation_kpi:*', 'probation_evaluation:*', 'probation_confirmation:*',
    'performance:*', 'okr:*',
    'training:*', 'training_feedback:*', 'training_analytics:*', 'certification:*', 'training_compliance:*',
    'career_development:*', 'internal_transfer:*', 'salary_adjustment:*', 'succession_plan:*', 'promotion_proposal:*',
    'relations:*', 'offboarding:*',
  ],
  hr_manager: [
    'employee:*', 'department:*', 'position:*', 'job_grade:*',
    'user:*', 'user_profile:*', 'user_employment:*', 'user_compensation:*', 'user_lifecycle:*',
    'leave:*', 'attendance:*', 'attendance_correction:*', 'overtime:*', 'flex_work:*',
    'punctuality:*', 'timesheet:*', 'attendance_report:*', 'hr_payroll:*',
    'job:*', 'job_approval:*', 'candidate:*', 'applicant:*', 'job_application:*', 'interview:*', 'offer:*',
    'onboarding:*', 'onboarding_task:*', 'onboarding_checklist:*', 'asset_provisioning:*',
    'policy_acknowledgement:*', 'probation_plan:*', 'probation_kpi:*', 'probation_evaluation:*', 'probation_confirmation:*',
    'performance:*', 'okr:*',
    'training:*', 'training_feedback:*', 'training_analytics:*', 'certification:*', 'training_compliance:*',
    'career_development:*', 'internal_transfer:*', 'salary_adjustment:*', 'succession_plan:*', 'promotion_proposal:*',
    'relations:*', 'offboarding:*',
  ],
  hr_assistant: [
    'employee:view', 'employee:create',
    'leave:view', 'leave:create',
    'attendance:view', 'attendance_correction:view', 'overtime:view',
    'department:view', 'position:view',
    'user_profile:view', 'user_profile:update',
  ],
  finance: ['invoice:*', 'expense:*', 'finance_report:*', 'hr_payroll:*'],
  finance_manager: ['invoice:*', 'expense:*', 'finance_report:*', 'hr_payroll:*'],
  finance_accountant: ['invoice:view', 'invoice:create', 'expense:view', 'expense:create', 'finance_report:view', 'hr_payroll:view'],
  project_manager: ['project:*', 'task:*'],
  pm_lead: ['project:view', 'project:create', 'task:view', 'task:create', 'task:assign'],
  pm_member: ['project:view', 'task:view'],
  crm_manager: ['crm_client:*', 'deal:*', 'pipeline:view', 'pipeline:manage'],
  crm_lead: ['crm_client:*', 'deal:*', 'pipeline:view', 'pipeline:manage'],
  crm_agent: ['crm_client:view', 'crm_client:create', 'deal:view', 'deal:create', 'pipeline:view'],
  brain_operator: ['brain_config:*'],
  brain_admin: ['brain_config:*'],
  brain_viewer: ['brain_config:view'],
};

const DATABASE_URL = process.env['DATABASE_URL'];
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const { pool, adapter } = createPrismaPgAdapter({
  connectionString: DATABASE_URL,
  max: 5,
});
const prisma = new PrismaClient({ adapter });

function matchPattern(slug: string, pattern: string): boolean {
  if (pattern === '*') return true;
  if (pattern.includes('*')) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(slug);
  }
  return slug === pattern;
}

async function verifyAndFixRbac(): Promise<void> {
  console.log('🔍 Starting RBAC verification...\n');

  // 1. Check all roles exist
  const dbRoles = await prisma.role.findMany({
    select: { id: true, name: true },
  });
  console.log(`📋 Found ${dbRoles.length} roles in database:`);
  dbRoles.forEach(r => console.log(`   - ${r.name}`));

  const expectedRoles = Object.keys(ROLE_PERMISSIONS);
  const missingRoles = expectedRoles.filter(r => !dbRoles.some(db => db.name === r));
  if (missingRoles.length > 0) {
    console.log(`\n⚠️  Missing roles: ${missingRoles.join(', ')}`);
  }

  // 2. Check all permissions exist
  const dbPermissions = await prisma.permission.findMany({
    select: { id: true, slug: true },
  });
  console.log(`\n📋 Found ${dbPermissions.length} permissions in database`);

  // 3. Check role-permission mappings
  const roleIdByName = new Map(dbRoles.map(r => [r.name, r.id]));
  const permissionIdBySlug = new Map(dbPermissions.map(p => [p.slug, p.id]));
  const allPerms = Array.from(permissionIdBySlug.keys());

  let totalMissing = 0;
  let totalFixed = 0;

  for (const [roleName, permPatterns] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleIdByName.get(roleName);
    if (!roleId) {
      console.log(`\n❌ Role not found: ${roleName}`);
      continue;
    }

    // Get existing permissions for this role
    const existingMappings = await prisma.rolePermission.findMany({
      where: { roleId },
      select: { permission: { select: { slug: true } } },
    });
    const existingSlugs = new Set(existingMappings.map(m => m.permission.slug));

    // Find expected permissions based on patterns
    const expectedSlugs = new Set<string>();
    for (const pattern of permPatterns) {
      const matching = allPerms.filter(slug => matchPattern(slug, pattern));
      matching.forEach(slug => expectedSlugs.add(slug));
    }

    // Check for missing permissions
    const missing = [...expectedSlugs].filter(slug => !existingSlugs.has(slug));
    
    if (missing.length > 0) {
      console.log(`\n🔧 Role "${roleName}" missing ${missing.length} permissions:`);
      missing.slice(0, 10).forEach(slug => console.log(`   - ${slug}`));
      if (missing.length > 10) {
        console.log(`   ... and ${missing.length - 10} more`);
      }
      totalMissing += missing.length;

      // Fix missing permissions
      for (const slug of missing) {
        const permId = permissionIdBySlug.get(slug);
        if (!permId) {
          console.log(`   ⚠️  Permission "${slug}" not found in permission catalog`);
          continue;
        }

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
        totalFixed++;
      }
      console.log(`   ✅ Fixed ${missing.length} permissions for ${roleName}`);
    } else {
      console.log(`\n✅ Role "${roleName}" has all ${expectedSlugs.size} permissions`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   - Total missing permissions found: ${totalMissing}`);
  console.log(`   - Total permissions fixed: ${totalFixed}`);

  if (totalMissing === 0) {
    console.log(`\n🎉 All role-permission mappings are correctly configured!`);
  } else if (totalFixed === totalMissing) {
    console.log(`\n✅ All missing permissions have been fixed!`);
  } else {
    console.log(`\n⚠️  Some permissions could not be fixed (missing from permission catalog)`);
  }
}

async function checkUserPermissions(keycloakId?: string): Promise<void> {
  if (!keycloakId) {
    console.log('\n📋 Skipping user permission check (no keycloakId provided)');
    return;
  }

  console.log(`\n🔍 Checking permissions for user with keycloakId: ${keycloakId}`);

  const user = await prisma.user.findUnique({
    where: { keycloakId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    console.log(`   ❌ User not found with keycloakId: ${keycloakId}`);
    return;
  }

  console.log(`   ✅ Found user: ${user.email} (${user.id})`);
  console.log(`   📋 User roles:`);
  
  const allPermissions = new Set<string>();
  for (const userRole of user.roles) {
    console.log(`      - ${userRole.role.name}`);
    for (const rp of userRole.role.permissions) {
      allPermissions.add(rp.permission.slug);
    }
  }

  console.log(`   📋 Effective permissions (${allPermissions.size}):`);
  [...allPermissions].sort().slice(0, 20).forEach(p => console.log(`      - ${p}`));
  if (allPermissions.size > 20) {
    console.log(`      ... and ${allPermissions.size - 20} more`);
  }

  if (allPermissions.has('employee:view') || allPermissions.has('employee:*') || allPermissions.has('*')) {
    console.log(`   ✅ User has employee:view permission!`);
  } else {
    console.log(`   ❌ User is MISSING employee:view permission!`);
  }
}

async function main(): Promise<void> {
  const keycloakId = process.argv[2];
  
  try {
    await verifyAndFixRbac();
    await checkUserPermissions(keycloakId);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
