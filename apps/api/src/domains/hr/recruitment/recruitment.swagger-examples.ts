const metaExample = {
  timestamp: '2026-03-05T09:00:00.000Z',
  requestId: 'req_01HZXA0C6S0K4Y0P8R2M9D7WQ1',
};

const envelope = <TData>(message: string, data: TData) => ({
  success: true,
  message,
  data,
  error: null,
  meta: metaExample,
});

export const jobExample = {
  id: 'a4b8e6cc-3df0-4e38-8a6d-40d6e8b1ea2f',
  title: 'Senior Backend Engineer',
  slug: 'senior-backend-engineer',
  departmentId: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
  positionId: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
  description: 'Lead backend architecture and delivery.',
  summary: 'Backend platform leadership role.',
  experienceLevel: 'SENIOR',
  contractType: 'PERMANENT',
  employmentType: 'FULL_TIME',
  workLocationType: 'HYBRID',
  remoteScope: 'COUNTRY',
  city: 'Addis Ababa',
  country: 'Ethiopia',
  openings: 2,
  salaryMin: '100000.00',
  salaryMax: '180000.00',
  currency: 'USD',
  benefits: ['Health insurance', 'Annual bonus'],
  status: 'PENDING_FINANCE',
  creatorIsHr: false,
  applicationDeadline: '2026-04-30T23:59:59.000Z',
  publishedAt: null,
  createdById: '2bfec9e4-4f25-4f60-9167-5a74e1ef9f05',
  approvals: [
    {
      id: '3ecef240-7017-4efa-98b9-f731a1c8499a',
      stage: 'FINANCE',
      level: 1,
      requiredRole: 'finance_manager',
      approverId: null,
      decision: 'PENDING',
      autoApproved: false,
      autoApprovalReason: null,
      comments: null,
      decidedAt: null,
      createdAt: '2026-03-05T09:00:00.000Z',
    },
  ],
  skills: [
    {
      id: '2af0f6be-019b-4d72-a660-49db7d05383f',
      name: 'TypeScript',
      level: 'ADVANCED',
      required: true,
      order: 1,
    },
  ],
  tools: [
    {
      id: 'da0a642e-c61a-4f8c-a89f-eb6b3f59615a',
      name: 'Docker',
      order: 1,
    },
  ],
  responsibilities: [
    {
      id: '8702dc22-4350-4498-bf8f-5a95122734c0',
      description: 'Design backend architecture.',
      order: 1,
    },
  ],
  createdAt: '2026-03-05T09:00:00.000Z',
  updatedAt: '2026-03-05T09:00:00.000Z',
};

export const jobResponseEnvelope = envelope('Created job', jobExample);
export const jobListResponseEnvelope = envelope('List of jobs', [jobExample]);
export const jobSkillsResponseEnvelope = envelope(
  'Updated job skills',
  jobExample.skills,
);
export const jobToolsResponseEnvelope = envelope(
  'Updated job tools',
  jobExample.tools,
);
export const jobResponsibilitiesResponseEnvelope = envelope(
  'Updated job responsibilities',
  jobExample.responsibilities,
);

export const candidateExample = {
  id: '7f4d5938-1031-4b42-9369-f64b5b3de2ca',
  firstName: 'Abel',
  lastName: 'Tesfaye',
  email: 'abel.tesfaye@example.com',
  phone: '+251912345678',
  gender: 'MALE',
  yearsExperience: 6,
  linkedinUrl: 'https://linkedin.com/in/abeltesfaye',
  portfolioUrl: null,
  githubUrl: 'https://github.com/abeltesfaye',
  source: 'LINKEDIN',
  referredById: null,
  resumeUrl: 'https://cdn.example.com/cv/abel.pdf',
  skills: [
    {
      id: '4f6ef96a-d69f-4233-96bf-a67d39f419ce',
      name: 'NestJS',
      level: 'ADVANCED',
      years: 4,
    },
  ],
  createdAt: '2026-03-05T09:00:00.000Z',
  updatedAt: '2026-03-05T09:00:00.000Z',
};

export const candidateResponseEnvelope = envelope(
  'Created candidate',
  candidateExample,
);
export const candidateListResponseEnvelope = envelope('List of candidates', [
  candidateExample,
]);

export const applicationExample = {
  id: '8dea40a6-4ee2-4cca-9ff3-ac9e95e50384',
  jobId: jobExample.id,
  candidateId: candidateExample.id,
  status: 'SCREENING',
  coverLetter: 'I have built high-scale APIs in NestJS.',
  expectedSalary: '145000.00',
  appliedAt: '2026-03-05T09:05:00.000Z',
  sourceSnapshot: {
    source: 'LINKEDIN',
  },
  createdAt: '2026-03-05T09:05:00.000Z',
  updatedAt: '2026-03-05T09:10:00.000Z',
};

export const applicationResponseEnvelope = envelope(
  'Created job application',
  applicationExample,
);
export const applicationListResponseEnvelope = envelope(
  'List of job applications',
  [applicationExample],
);

export const interviewExample = {
  id: 'd85dc0db-d6dc-49b8-b91f-b6dd0ffea88a',
  applicationId: applicationExample.id,
  type: 'TECHNICAL',
  round: 1,
  status: 'SCHEDULED',
  scheduledAt: '2026-03-10T10:00:00.000Z',
  completedAt: null,
  interviewerId: 'f8ef7938-8b1e-4a6e-bd25-c61432540273',
  interviewers: [{ name: 'Tech Lead', role: 'Panelist' }],
  feedback: null,
  endorsement: null,
  score: null,
  nextAction: 'Submit feedback',
  createdAt: '2026-03-05T09:15:00.000Z',
  updatedAt: '2026-03-05T09:15:00.000Z',
};

export const interviewResponseEnvelope = envelope(
  'Created interview',
  interviewExample,
);
export const interviewListResponseEnvelope = envelope('List of interviews', [
  interviewExample,
]);
