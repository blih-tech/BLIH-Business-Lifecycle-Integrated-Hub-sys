import type { PrismaClient } from '../src/prisma-client.js';

/**
 * Seeds the OnboardingTask library with the 8 standard tasks that map to
 * Stages 11–18 of the employee lifecycle. Uses upsert keyed on title
 * so the script is idempotent and safe to re-run.
 */
export async function seedOnboardingTasks(prisma: PrismaClient): Promise<void> {
  const tasks: Array<{
    title: string;
    description: string;
    taskType: 'NON_CUSTOM' | 'CUSTOM';
    targetDataModel: string | null;
    requiresHrVerification: boolean;
  }> = [
    {
      title: 'Complete Personal Information',
      description:
        'Update your profile with personal details including date of birth, gender, and marital status.',
      taskType: 'NON_CUSTOM',
      targetDataModel: 'USER_PROFILE',
      requiresHrVerification: true,
    },
    {
      title: 'Provide Home Address',
      description:
        'Enter your current residential address details including country, city, region, and street information.',
      taskType: 'NON_CUSTOM',
      targetDataModel: 'EMPLOYEE_ADDRESS',
      requiresHrVerification: true,
    },
    {
      title: 'Add Bank Account Details',
      description:
        'Provide your banking information for salary payments. Include bank name, branch, account type, and account number.',
      taskType: 'NON_CUSTOM',
      targetDataModel: 'EMPLOYEE_BANK_DETAIL',
      requiresHrVerification: true,
    },
    {
      title: 'Add Emergency Contact',
      description:
        'Enter emergency contact details including name, relationship, phone number, and email address.',
      taskType: 'NON_CUSTOM',
      targetDataModel: 'EMPLOYEE_EMERGENCY_CONTACT',
      requiresHrVerification: true,
    },
    {
      title: 'Confirm Education History',
      description:
        'Provide or confirm your educational background including institution, degree, field of study, and dates attended.',
      taskType: 'NON_CUSTOM',
      targetDataModel: 'EMPLOYEE_EDUCATION',
      requiresHrVerification: true,
    },
    {
      title: 'Upload Required Documents',
      description:
        'Upload mandatory documents such as national ID, certificates, and other required files for your employee record.',
      taskType: 'NON_CUSTOM',
      targetDataModel: 'EMPLOYEE_DOCUMENT',
      requiresHrVerification: true,
    },
    {
      title: 'Review & Acknowledge Policies',
      description:
        'Read and acknowledge all company policies that apply to your role. You must accept each policy to proceed.',
      taskType: 'NON_CUSTOM',
      targetDataModel: 'EMPLOYEE_POLICY_ACKNOWLEDGEMENT',
      requiresHrVerification: false,
    },
    {
      title: 'Sign Employment Contract',
      description:
        'Review and sign your employment contract. Upload the signed copy if required.',
      taskType: 'NON_CUSTOM',
      targetDataModel: 'EMPLOYEE_CONTRACT',
      requiresHrVerification: true,
    },
  ];

  for (const task of tasks) {
    await prisma.onboardingTask.upsert({
      where: {
        // Prisma requires a unique field for `where`. Since title is not @unique
        // we use a raw approach: find-or-create pattern.
        id: (
          await prisma.onboardingTask.findFirst({
            where: { title: task.title },
            select: { id: true },
          })
        )?.id ?? '00000000-0000-0000-0000-000000000000',
      },
      update: {
        description: task.description,
        taskType: task.taskType as any,
        targetDataModel: task.targetDataModel as any,
        requiresHrVerification: task.requiresHrVerification,
      },
      create: {
        title: task.title,
        description: task.description,
        taskType: task.taskType as any,
        targetDataModel: task.targetDataModel as any,
        requiresHrVerification: task.requiresHrVerification,
      },
    });
  }

  console.log(`Seeded ${tasks.length} onboarding tasks.`);
}
