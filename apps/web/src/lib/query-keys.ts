export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },
  hr: {
    all: ['hr'] as const,
    employees: () => [...queryKeys.hr.all, 'employees'] as const,
    employee: (id: string) => [...queryKeys.hr.employees(), id] as const,
    departments: () => [...queryKeys.hr.all, 'departments'] as const,
    positions: () => [...queryKeys.hr.all, 'positions'] as const,
    leaves: () => [...queryKeys.hr.all, 'leaves'] as const,
    leave: (id: string) => [...queryKeys.hr.leaves(), id] as const,
    attendance: () => [...queryKeys.hr.all, 'attendance'] as const,
    payroll: () => [...queryKeys.hr.all, 'payroll'] as const,
    recruitment: () => [...queryKeys.hr.all, 'recruitment'] as const,
    jobs: () => [...queryKeys.hr.recruitment(), 'jobs'] as const,
    job: (id: string) => [...queryKeys.hr.jobs(), id] as const,
    applicants: (jobId: string) =>
      [...queryKeys.hr.recruitment(), 'applicants', jobId] as const,
  },
  crm: {
    all: ['crm'] as const,
    contacts: () => [...queryKeys.crm.all, 'contacts'] as const,
    contact: (id: string) => [...queryKeys.crm.contacts(), id] as const,
    companies: () => [...queryKeys.crm.all, 'companies'] as const,
    deals: () => [...queryKeys.crm.all, 'deals'] as const,
  },
  finance: {
    all: ['finance'] as const,
    invoices: () => [...queryKeys.finance.all, 'invoices'] as const,
    transactions: () => [...queryKeys.finance.all, 'transactions'] as const,
    accounts: () => [...queryKeys.finance.all, 'accounts'] as const,
  },
  project: {
    all: ['project'] as const,
    projects: () => [...queryKeys.project.all, 'projects'] as const,
    project: (id: string) => [...queryKeys.project.projects(), id] as const,
    tasks: (projectId: string) =>
      [...queryKeys.project.all, 'tasks', projectId] as const,
  },
  brain: {
    all: ['brain'] as const,
    documents: () => [...queryKeys.brain.all, 'documents'] as const,
    knowledge: () => [...queryKeys.brain.all, 'knowledge'] as const,
  },
  chatbot: {
    all: ['chatbot'] as const,
    conversations: () => [...queryKeys.chatbot.all, 'conversations'] as const,
  },
} as const;
