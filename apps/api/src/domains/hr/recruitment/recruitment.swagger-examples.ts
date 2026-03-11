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
    status: {
      workflow: 'PENDING_FOR_APPROVAL',
      approvals: {
        finance: 'PENDING_FOR_APPROVAL',
        gm: 'PENDING_FOR_APPROVAL',
        hr: 'PENDING_FOR_APPROVAL',
      },
    },
    priority: 'MEDIUM',
    draftedAt: '2026-03-05T09:00:00.000Z',
    pendingApprovalAt: '2026-03-05T09:10:00.000Z',
    readyToPostAt: null,
    rejectedAt: null,
  },
  job: {
    id: 'a4b8e6cc-3df0-4e38-8a6d-40d6e8b1ea2f',
    title: 'Senior Frontend Engineer',
    slug: 'senior-backend-engineer',
    departmentId: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
    positionId: '8b76752b-df18-45bc-af74-1ea9a0db2e40',
    description: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          text: 'Lead frontend delivery for customer-facing products.',
        },
      ],
    },
    summary: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          text: 'Join a fast-moving product team with strong ownership.',
        },
      ],
    },
    experienceLevel: 'SENIOR',
    contractType: 'PERMANENT',
    employmentType: 'FULL_TIME',
    workLocationType: 'HYBRID',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    openings: 2,
    salaryMin: '2000.00',
    salaryMax: '3000.00',
    currency: 'USD',
    salaryMode: 'COMPETITIVE',
    benefits: ['Health insurance', 'Learning budget'],
    requiredSkills: ['react', 'typescript'],
    preferredSkills: ['next.js'],
    responsibilities: [
      'Lead frontend delivery',
      'Collaborate with product and design',
    ],
    tools: ['Docker', 'GitHub Actions'],
    creatorIsHr: false,
    hiringManagerId: '6e40348d-4fda-47a7-b267-13ed7b6fca68',
    publishedAt: null,
    closedAt: null,
    closingReason: null,
    viewsCount: 18,
    applicationsCount: 5,
    shortlistedCount: 2,
    interviewsCount: 3,
    offersCount: 1,
    hiresCount: 0,
    createdById: '2bfec9e4-4f25-4f60-9167-5a74e1ef9f05',
    applicationDeadline: '2026-04-30T23:59:59.000Z',
    createdAt: '2026-03-05T09:00:00.000Z',
    updatedAt: '2026-03-05T09:00:00.000Z',
  },
  applicationForm: {
    id: '9fe81a43-af25-4dea-a2d8-f1703a5f8de5',
    jobId: 'a4b8e6cc-3df0-4e38-8a6d-40d6e8b1ea2f',
    applicantFields: [
      {
        id: '8f9f5f06-09db-4c74-ad79-3527cfbfed8f',
        key: 'PHONE',
        label: 'Phone Number',
        type: 'TEXT',
        enabled: true,
        required: false,
        helpText: 'Primary contact phone number including country code.',
        options: [],
        order: 1,
      },
      {
        id: 'f6e1afc2-bf26-45a9-9fb8-f4fc6bf0f9f0',
        key: 'LINKEDIN_URL',
        label: 'LinkedIn URL',
        type: 'TEXT',
        enabled: true,
        required: false,
        helpText: 'Candidate LinkedIn profile URL.',
        options: [],
        order: 2,
      },
      {
        id: 'd8e0cf72-90b2-4f7f-8704-7f91bf6bcc5e',
        key: 'EXPECTED_SALARY',
        label: 'Expected Salary',
        type: 'NUMBER',
        enabled: true,
        required: false,
        helpText: 'Candidate salary expectation for the role.',
        options: [],
        order: 3,
      },
    ],
    sections: [
      {
        id: 'bcc7f621f-b6cd-4916-a5fd-bf61b2abf5c4',
        key: 'EDUCATION',
        label: 'Education',
        type: 'SECTION',
        enabled: true,
        required: false,
        helpText: 'Collect education history entries.',
        options: [],
        fields: [
          {
            key: 'INSTITUTION',
            label: 'Institution',
            type: 'TEXT',
            required: true,
            helpText: 'Name of school, college, or university.',
            options: [],
            order: 1,
          },
          {
            key: 'DEGREE',
            label: 'Degree',
            type: 'TEXT',
            required: true,
            helpText: 'Degree or qualification obtained.',
            options: [],
            order: 2,
          },
          {
            key: 'FIELD',
            label: 'Field of Study',
            type: 'TEXT',
            required: true,
            helpText: 'Major or specialization.',
            options: [],
            order: 3,
          },
          {
            key: 'START_DATE',
            label: 'Start Date',
            type: 'DATE',
            required: false,
            helpText: 'Education start date.',
            options: [],
            order: 4,
          },
          {
            key: 'END_DATE',
            label: 'End Date',
            type: 'DATE',
            required: false,
            helpText: 'Education completion date.',
            options: [],
            order: 5,
          },
        ],
        order: 1,
      },
      {
        id: 'acc7f621f-b6cd-4916-a5fd-bf61b2abf5c4',
        key: 'EXPERIENCE',
        label: 'Experience',
        type: 'SECTION',
        enabled: true,
        required: false,
        helpText: 'Collect professional experience entries.',
        options: [],
        fields: [
          {
            key: 'COMPANY',
            label: 'Company',
            type: 'TEXT',
            required: true,
            helpText: 'Employer or organization name.',
            options: [],
            order: 1,
          },
          {
            key: 'TITLE',
            label: 'Job Title',
            type: 'TEXT',
            required: true,
            helpText: 'Role title held by the applicant.',
            options: [],
            order: 2,
          },
          {
            key: 'START_DATE',
            label: 'Start Date',
            type: 'DATE',
            required: false,
            helpText: 'Employment start date.',
            options: [],
            order: 3,
          },
          {
            key: 'END_DATE',
            label: 'End Date',
            type: 'DATE',
            required: false,
            helpText: 'Employment end date.',
            options: [],
            order: 4,
          },
          {
            key: 'DESCRIPTION',
            label: 'Description',
            type: 'TEXTAREA',
            required: false,
            helpText: 'Key responsibilities and impact.',
            options: [],
            order: 5,
          },
        ],
        order: 2,
      },
    ],
    customFields: [
      {
        id: 'custom-456',
        label: 'Do you need visa sponsorship?',
        type: 'SELECT',
        required: true,
        helpText: null,
        options: ['Yes', 'No'],
      },
    ],
  },
  approvals: [],
};

export const applicantExample = {
  id: '7f4d5938-1031-4b42-9369-f64b5b3de2ca',
  jobId: jobExample.job.id,
  applicationFormId: jobExample.applicationForm.id,
  firstName: 'Abel',
  lastName: 'Tesfaye',
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
  nationality: 'Ethiopian',
  expectedSalary: '145000.00',
  currentSalary: '125000.00',
  educationLevel: 'BACHELOR',
  highestDegree: 'BSc Computer Science',
  skills: ['react', 'typescript', 'graphql'],
  status: 'SCREENING',
  coverLetter: 'I have built high-scale APIs in TypeScript.',
  sourceSnapshot: { source: 'LINKEDIN' },
  customFieldValues: null,
  appliedAt: '2026-03-05T09:05:00.000Z',
  screeningAt: '2026-03-05T15:00:00.000Z',
  shortlistedAt: null,
  interviewAt: null,
  waitlistAt: null,
  offerAt: null,
  hiredAt: null,
  rejectedAt: null,
  withdrawnAt: null,
  lastActivityAt: '2026-03-05T15:00:00.000Z',
  profileScore: 70,
  educations: [],
  experiences: [],
  statusHistory: [
    {
      id: '9b6d4a2e-9f95-45a1-b66b-e8e08680d2b5',
      changedById: '2bfec9e4-4f25-4f60-9167-5a74e1ef9f05',
      fromStatus: 'APPLIED',
      toStatus: 'SCREENING',
      notes: 'Strong profile for the role',
      changedAt: '2026-03-05T15:00:00.000Z',
    },
  ],
  createdAt: '2026-03-05T09:00:00.000Z',
  updatedAt: '2026-03-05T09:00:00.000Z',
};

export const offerExample = {
  id: 'c2a7d7e8-6a7f-4b58-9b92-0c2b6c4f77c1',
  jobId: jobExample.job.id,
  applicantId: applicantExample.id,
  createdById: '2bfec9e4-4f25-4f60-9167-5a74e1ef9f05',
  status: 'SENT',
  salary: '145000.00',
  currency: 'USD',
  startDate: '2026-04-01T00:00:00.000Z',
  payFrequency: 'MONTHLY',
  employmentType: 'FULL_TIME',
  bonus: '5000.00',
  equity: null,
  offerLetterUrl: 'https://cdn.example.com/offers/offer-letter.pdf',
  notes: 'Offer sent after final interview.',
  sentAt: '2026-03-20T10:00:00.000Z',
  respondedAt: null,
  expiresAt: '2026-03-31T23:59:59.000Z',
  onboardingId: null,
  createdAt: '2026-03-20T09:55:00.000Z',
  updatedAt: '2026-03-20T10:00:00.000Z',
};

export const interviewExample = {
  id: 'af0f3efe-e71b-4b73-a9ef-2b6f8dcba123',
  jobId: jobExample.job.id,
  type: 'TECHNICAL',
  round: 1,
  status: 'SCHEDULED',
  scheduledAt: '2026-03-10T10:00:00.000Z',
  durationMinutes: 90,
  location: null,
  meetingUrl: null,
  createdById: '2bfec9e4-4f25-4f60-9167-5a74e1ef9f05',
  participants: [
    {
      id: '6bd5ff77-f43d-4385-ad6b-87945c131ec3',
      sessionId: 'af0f3efe-e71b-4b73-a9ef-2b6f8dcba123',
      applicantId: applicantExample.id,
      attendanceStatus: 'SCHEDULED',
      applicant: {
        id: applicantExample.id,
        firstName: applicantExample.firstName,
        lastName: applicantExample.lastName,
        email: applicantExample.email,
        status: applicantExample.status,
      },
      createdAt: '2026-03-05T09:15:00.000Z',
    },
  ],
  interviewers: [
    {
      id: '833be5c5-f4f8-4686-830a-a4e61f3af4d5',
      sessionId: 'af0f3efe-e71b-4b73-a9ef-2b6f8dcba123',
      interviewerId: 'f8ef7938-8b1e-4a6e-bd25-c61432540273',
      role: 'Panelist',
      interviewer: {
        id: 'f8ef7938-8b1e-4a6e-bd25-c61432540273',
        firstName: 'Liya',
        lastName: 'Tekle',
        email: 'liya.tekle@example.com',
        status: 'ACTIVE',
      },
      createdAt: '2026-03-05T09:15:00.000Z',
    },
  ],
  feedbacks: [],
  createdAt: '2026-03-05T09:15:00.000Z',
  updatedAt: '2026-03-05T09:15:00.000Z',
};

export const interviewFeedbackExample = {
  id: 'de55a2d6-7df0-4324-8151-c478226cde2a',
  participantId: interviewExample.participants[0].id,
  assignmentId: interviewExample.interviewers[0].id,
  interviewerId: interviewExample.interviewers[0].interviewerId,
  score: 84.5,
  endorsement: 'YES',
  strengths: ['Strong system design', 'Clear communication'],
  weaknesses: ['Needs deeper PostgreSQL tuning experience'],
  questionResponses: [
    {
      questionId: 'dfef45a5-6bf0-4b6a-a30f-7885fbe7c89d',
      question: 'Explain REST API principles',
      category: 'TECHNICAL',
      type: 'TEXT',
      answer:
        'Candidate explained constraints, statelessness, resource naming, and status code semantics.',
      score: 4,
      maxScore: 5,
      weight: 1,
      notes: 'Strong understanding',
    },
    {
      questionId: null,
      question: 'Describe a conflict you resolved in a project team',
      category: 'BEHAVIORAL',
      type: 'TEXTAREA',
      answer:
        'Candidate described a production incident conflict and a clear resolution process.',
      score: 3,
      maxScore: 5,
      weight: 1,
      notes: 'Good communication and ownership',
    },
  ],
  notes: 'Recommended to proceed to final round.',
  isDraft: false,
  submittedAt: '2026-03-10T12:05:00.000Z',
  createdAt: '2026-03-10T12:05:00.000Z',
  updatedAt: '2026-03-10T12:05:00.000Z',
};

export const interviewQuestionExample = {
  id: 'dfef45a5-6bf0-4b6a-a30f-7885fbe7c89d',
  question: 'Explain REST API principles',
  description:
    'Assess understanding of REST constraints and practical API design.',
  category: 'TECHNICAL',
  type: 'TEXT',
  options: [],
  difficulty: 3,
  tags: ['rest', 'api', 'backend'],
  createdById: '2bfec9e4-4f25-4f60-9167-5a74e1ef9f05',
  isActive: true,
  createdAt: '2026-03-05T09:20:00.000Z',
  updatedAt: '2026-03-05T09:20:00.000Z',
};

export const jobResponseEnvelope = envelope('Created job', jobExample);
export const jobListResponseEnvelope = envelope('List of jobs', [jobExample]);
export const jobSkillsResponseEnvelope = envelope('Updated job skills', {
  requiredSkills: ['typescript', 'postgresql'],
  preferredSkills: ['aws'],
});
export const jobToolsResponseEnvelope = envelope('Updated job tools', {
  tools: jobExample.job.tools,
});
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

export const offerResponseEnvelope = envelope('Created offer', offerExample);
export const offerListResponseEnvelope = envelope('List of offers', [
  offerExample,
]);

export const interviewResponseEnvelope = envelope(
  'Created interview session',
  interviewExample,
);
export const interviewListResponseEnvelope = envelope(
  'List of interview sessions',
  [interviewExample],
);
export const interviewFeedbackResponseEnvelope = envelope(
  'Upserted interview feedback',
  interviewFeedbackExample,
);
export const interviewFeedbackListResponseEnvelope = envelope(
  'List interview participant feedback',
  [interviewFeedbackExample],
);
export const interviewQuestionResponseEnvelope = envelope(
  'Created interview question',
  interviewQuestionExample,
);
export const interviewQuestionListResponseEnvelope = envelope(
  'List of interview questions',
  [interviewQuestionExample],
);
