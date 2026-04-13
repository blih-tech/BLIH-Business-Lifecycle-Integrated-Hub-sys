import type { EmploymentContract } from './types';

export const employmentContracts: EmploymentContract[] = [
  {
    id: 'contract-1',
    taskId: 'task-1',
    status: 'TODO',

    name: 'Jessica Parker',
    role: 'Full Stack Developer',
    department: 'Technical Dept.',
    avatarText: 'JP',
    offerSentOn: 'Dec 30, 2025',
    roleSummary: 'Develop and maintain full-stack applications...',
    responsibilities: [
      'Experience with digital marketing',
      'Strong analytical skills',
      'Team leadership experience',
    ],
    overview: {
      startDate: 'Dec 30, 2025',
      workHours: '40 hrs/wk',
      probationPeriod: '3 months',
      salaryPayroll: '15,000',
    },
  },
  {
    id: 'contract-2',
    taskId: 'task-2',
    status: 'SUBMITTED',

    name: 'Jessica Parker',
    role: 'Full Stack Developer',
    department: 'Technical Dept.',
    avatarText: 'JP',
    offerSentOn: 'Jan 06, 2026',
    roleSummary: 'Build and improve internal tools...',
    responsibilities: [
      'Collaborate across engineering squads',
      'Document system decisions',
      'Support release quality checks',
    ],
    overview: {
      startDate: 'Jan 10, 2026',
      workHours: '40 hrs/wk',
      probationPeriod: '3 months',
      salaryPayroll: '15,000',
    },
  },
  {
    id: 'contract-3',
    taskId: 'task-3',
    status: 'COMPLETED',

    name: 'Jessica Parker',
    role: 'Full Stack Developer',
    department: 'Technical Dept.',
    avatarText: 'JP',
    offerSentOn: 'Jan 18, 2026',
    roleSummary: 'Design scalable backend APIs...',
    responsibilities: [
      'Define API contracts',
      'Mentor junior engineers',
      'Optimize deployment cycles',
    ],
    overview: {
      startDate: 'Jan 22, 2026',
      workHours: '40 hrs/wk',
      probationPeriod: '3 months',
      salaryPayroll: '15,000',
    },
  },
];
