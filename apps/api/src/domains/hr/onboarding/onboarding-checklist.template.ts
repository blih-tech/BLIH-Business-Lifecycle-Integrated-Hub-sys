export type TemplateTaskDepartment = 'HR' | 'IT' | 'ADMIN' | 'TEAM';

export interface TemplateTaskDef {
  department: TemplateTaskDepartment;
  title: string;
  description: string | null;
  dueDaysFromJoin: number;
}

const BASE_TASKS: TemplateTaskDef[] = [
  {
    department: 'HR',
    title: 'Email account created',
    description: 'Corporate email account provisioned',
    dueDaysFromJoin: 0,
  },
  {
    department: 'IT',
    title: 'Workstation setup',
    description: 'Laptop/desktop and peripherals',
    dueDaysFromJoin: 0,
  },
  {
    department: 'HR',
    title: 'Payroll registration',
    description: 'Bank details and tax forms',
    dueDaysFromJoin: 3,
  },
  {
    department: 'ADMIN',
    title: 'Access card',
    description: 'Building and door access',
    dueDaysFromJoin: 0,
  },
];

const BY_EMPLOYMENT_TYPE: Partial<Record<string, TemplateTaskDef[]>> = {
  FULL_TIME: [
    {
      department: 'HR',
      title: 'Benefits enrollment',
      description: 'Health and other benefits',
      dueDaysFromJoin: 14,
    },
    {
      department: 'TEAM',
      title: 'Mentor assigned',
      description: 'Buddy/mentor introduction',
      dueDaysFromJoin: 1,
    },
  ],
  CONTRACT: [
    {
      department: 'HR',
      title: 'Contract documents signed',
      description: 'Contract and annexes',
      dueDaysFromJoin: 0,
    },
    {
      department: 'HR',
      title: 'End date reminder set',
      description: 'Contract end date tracked',
      dueDaysFromJoin: 7,
    },
  ],
};

/** Role is inferred from position title (e.g. contains "Manager", "Engineer"). */
export function getOnboardingTemplateTasks(
  employmentType: string = 'FULL_TIME',
  positionTitle: string | null,
): TemplateTaskDef[] {
  const tasks = [...BASE_TASKS];
  const byType = BY_EMPLOYMENT_TYPE[employmentType];
  if (byType) tasks.push(...byType);

  const title = (positionTitle ?? '').toUpperCase();
  if (title.includes('MANAGER')) {
    tasks.push(
      {
        department: 'IT',
        title: 'Approval permissions',
        description: 'Workflow approval access',
        dueDaysFromJoin: 5,
      },
      {
        department: 'TEAM',
        title: 'Team calendar access',
        description: 'Team and department calendar',
        dueDaysFromJoin: 3,
      },
    );
  }
  if (title.includes('ENGINEER') || title.includes('DEVELOPER')) {
    tasks.push(
      {
        department: 'IT',
        title: 'Dev environment',
        description: 'IDE, tools, VPN',
        dueDaysFromJoin: 3,
      },
      {
        department: 'IT',
        title: 'Repository access',
        description: 'Git and project repos',
        dueDaysFromJoin: 1,
      },
    );
  }

  return tasks;
}

/** Add business days to a date (simple: no holiday calendar). */
export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const d = result.getDay();
    if (d !== 0 && d !== 6) added++;
  }
  return result;
}
