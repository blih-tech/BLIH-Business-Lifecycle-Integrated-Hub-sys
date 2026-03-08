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
  slug: 'senior-backend-engineer',
  status: 'PENDING_FOR_APPROVAL',
  financeApprovalStatus: 'PENDING_FOR_APPROVAL',
  gmApprovalStatus: 'PENDING_FOR_APPROVAL',
  hrApprovalStatus: 'PENDING_FOR_APPROVAL',
  creatorIsHr: false,
  priority: 'MEDIUM',
  hiringManagerId: '6e40348d-4fda-47a7-b267-13ed7b6fca68',
  draftedAt: '2026-03-05T09:00:00.000Z',
  pendingApprovalAt: '2026-03-05T09:10:00.000Z',
  readyToPostAt: null,
  publishedAt: null,
  closedAt: null,
  rejectedAt: null,
  closingReason: null,
  viewsCount: 18,
  applicationsCount: 5,
  shortlistedCount: 2,
  interviewsCount: 3,
  offersCount: 1,
  hiresCount: 0,
  createdById: '2bfec9e4-4f25-4f60-9167-5a74e1ef9f05',
  requestForm: {
    id: 'e1eb2911-36d5-4304-9578-1976c4f95c8f',
    jobTitle: 'Senior Frontend Engineer',
    department: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
    requestedBy: 'Alice Njeri',
    position: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
    requestType: 'REPLACEMENT',
    replaceForUserId: '9f95c89f-3dcb-4fd7-a78d-33e5f1e8f12b',
    businessJustification: 'We need to backfill a critical delivery role.',
    employmentType: 'FULL_TIME',
    workMode: 'HYBRID',
    urgency: 'HIGH',
    neededByDate: '2026-03-30T00:00:00.000Z',
  },
  jobDetailsForm: {
    id: 'b2be246f-a95d-4645-8f08-ae2578b86766',
    jobTitle: 'Senior Frontend Engineer',
    location: 'Addis Ababa, Ethiopia',
    workMode: 'HYBRID',
    employmentType: 'FULL_TIME',
    jobSummary: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          text: 'Lead frontend delivery for customer-facing products.',
        },
      ],
    },
    whyJoinUs: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          text: 'Join a fast-moving product team with strong ownership.',
        },
      ],
    },
    requiredSkills: ['react', 'typescript'],
    preferredSkills: ['next.js'],
    responsibilities: [
      'Lead frontend delivery',
      'Collaborate with product and design',
    ],
    experienceLevel: 'SENIOR',
    salaryMin: '2000.00',
    salaryMax: '3000.00',
    salaryCurrency: 'USD',
    salaryMode: 'COMPETITIVE',
    benefits: ['Health insurance', 'Learning budget'],
    openings: 2,
    applicationDeadline: '2026-04-30T23:59:59.000Z',
  },
  applicationForm: {
    id: '9fe81a43-af25-4dea-a2d8-f1703a5f8de5',
    predefinedFields: [
      {
        id: '6764a508-5502-406c-8605-ec1fb15139fd',
        key: 'fullName',
        label: 'Full Name',
        type: 'TEXT',
        enabled: true,
        required: true,
      },
    ],
    customFields: [],
  },
  approvals: [],
  requiredSkills: ['react', 'typescript'],
  preferredSkills: ['next.js'],
  tools: [
    {
      id: 'da0a642e-c61a-4f8c-a89f-eb6b3f59615a',
      name: 'Docker',
      order: 1,
    },
  ],
  responsibilities: [
    'Lead frontend delivery',
    'Collaborate with product and design',
  ],
  createdAt: '2026-03-05T09:00:00.000Z',
  updatedAt: '2026-03-05T09:00:00.000Z',
};

export const applicantExample = {
  id: '7f4d5938-1031-4b42-9369-f64b5b3de2ca',
  jobId: jobExample.id,
  applicationFormId: jobExample.applicationForm.id,
  fullName: 'Abel Tesfaye',
  email: 'abel.tesfaye@example.com',
  phone: '+251912345678',
  resumeUrl: 'https://cdn.example.com/cv/abel.pdf',
  linkedinUrl: 'https://linkedin.com/in/abeltesfaye',
  portfolioUrl: null,
  githubUrl: 'https://github.com/abeltesfaye',
  source: 'LINKEDIN',
  referredById: null,
  currentCompany: 'TechCorp',
  currentPosition: 'Senior Engineer',
  yearsExperience: 6,
  location: 'Addis Ababa, Ethiopia',
  country: 'Ethiopia',
  city: 'Addis Ababa',
  nationality: 'Ethiopian',
  expectedSalary: '145000.00',
  currentSalary: '125000.00',
  educationLevel: 'BACHELOR',
  highestDegree: 'BSc Computer Science',
  skills: ['react', 'typescript', 'graphql'],
  status: 'SHORTLISTED',
  coverLetter: 'I have built high-scale APIs in TypeScript.',
  sourceSnapshot: { source: 'LINKEDIN' },
  customFieldValues: null,
  appliedAt: '2026-03-05T09:05:00.000Z',
  shortlistedAt: '2026-03-06T10:00:00.000Z',
  interviewAt: null,
  offerAt: null,
  hiredAt: null,
  rejectedAt: null,
  lastActivityAt: '2026-03-06T10:00:00.000Z',
  profileScore: 70,
  educations: [],
  experiences: [],
  statusHistory: [
    {
      id: '9b6d4a2e-9f95-45a1-b66b-e8e08680d2b5',
      changedById: '2bfec9e4-4f25-4f60-9167-5a74e1ef9f05',
      fromStatus: 'APPLIED',
      toStatus: 'SHORTLISTED',
      notes: 'Strong profile for the role',
      changedAt: '2026-03-06T10:00:00.000Z',
    },
  ],
  createdAt: '2026-03-05T09:00:00.000Z',
  updatedAt: '2026-03-05T09:00:00.000Z',
};

export const interviewExample = {
  id: 'd85dc0db-d6dc-49b8-b91f-b6dd0ffea88a',
  applicantId: applicantExample.id,
  type: 'TECHNICAL',
  round: 1,
  status: 'SCHEDULED',
  scheduledAt: '2026-03-10T10:00:00.000Z',
  startedAt: null,
  completedAt: null,
  durationMinutes: null,
  interviewerId: 'f8ef7938-8b1e-4a6e-bd25-c61432540273',
  location: null,
  meetingUrl: null,
  interviewers: [{ name: 'Tech Lead', role: 'Panelist' }],
  feedback: null,
  endorsement: null,
  score: null,
  nextAction: 'Submit feedback',
  notes: null,
  createdAt: '2026-03-05T09:15:00.000Z',
  updatedAt: '2026-03-05T09:15:00.000Z',
};

export const jobResponseEnvelope = envelope('Created job', jobExample);
export const jobListResponseEnvelope = envelope('List of jobs', [jobExample]);
export const jobSkillsResponseEnvelope = envelope('Updated job skills', {
  requiredSkills: ['typescript', 'postgresql'],
  preferredSkills: ['aws'],
});
export const jobToolsResponseEnvelope = envelope(
  'Updated job tools',
  jobExample.tools,
);
export const jobResponsibilitiesResponseEnvelope = envelope(
  'Updated job responsibilities',
  ['Design backend architecture.', 'Review pull requests.'],
);

export const applicantResponseEnvelope = envelope(
  'Created applicant',
  applicantExample,
);
export const applicantListResponseEnvelope = envelope('List of applicants', [
  applicantExample,
]);

export const interviewResponseEnvelope = envelope(
  'Created interview',
  interviewExample,
);
export const interviewListResponseEnvelope = envelope('List of interviews', [
  interviewExample,
]);
