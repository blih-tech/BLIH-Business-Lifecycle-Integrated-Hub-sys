import type {
  FullJobRequest,
  RequestsStatItem,
} from '@/features/hr/recruitment/requests/types';

export const jobRequests: FullJobRequest[] = [
  {
    status: 'posted',
    progress: {
      jm: { status: 'pending' },
      hr: { status: 'approved' },
      finance: { status: 'approved' },
    },
    requestForm: {
      jobTitle: 'HR Operations Specialist',
      department: 'technical',
      requestedBy: 'user1',
      position: 'hr_operations_specialist',
      requestType: 'new',
      replaceFor: '',
      businessJustification:
        'Expand HR operations capacity to support recruitment workflow rollout and reduce turnaround time across approvals.',
      employmentType: 'full_time',
      workMode: 'hybrid',
      urgency: 'medium',
      neededByDate: '2025-04-18',
    },
    jobDetailsForm: {
      jobTitle: 'HR Operations Specialist',
      location: 'Nairobi, Kenya',
      workMode: 'hybrid',
      employmentType: 'full_time',
      jobSummary:
        'Support recruitment operations, coordination, and reporting across the HR team.',
      whyJoinUs:
        'Help shape internal hiring operations in a fast-moving team with visible organizational impact.',
      keyResponsibilities: [
        'Coordinate recruitment workflows',
        'Maintain hiring records and reporting',
        'Support internal process improvements',
      ],
      requirements: [
        'HR operations',
        'Process coordination',
        'Reporting',
        'Stakeholder communication',
      ],
      preferredSkills: ['HRIS experience', 'Recruitment analytics'],
      experienceLevel: 'mid',
      salaryMode: 'competitive',
      salaryRangeMin: '',
      salaryRangeMax: '',
      salaryCurrency: '',
      benefits: ['Medical cover', 'Hybrid work support'],
    },
    applicationForm: {
      predefinedFields: [
        {
          key: 'full_name',
          label: 'Full Name',
          type: 'text',
          enabled: true,
          required: true,
        },
        {
          key: 'email',
          label: 'Email Address',
          type: 'text',
          enabled: true,
          required: true,
        },
        {
          key: 'resume',
          label: 'Resume / CV',
          type: 'file',
          enabled: true,
          required: true,
        },
      ],
      customFields: [],
    },
  },
  {
    status: 'posted',
    progress: {
      jm: { status: 'approved' },
      hr: { status: 'pending' },
      finance: { status: 'pending' },
    },
    requestForm: {
      jobTitle: 'Senior Software Engineer',
      department: 'technical',
      requestedBy: 'Alice Njeri',
      position: 'backend_engineer',
      requestType: 'new',
      replaceFor: '',
      businessJustification:
        'Scale the backend and platform teams to support Q2 product launches and reduce delivery bottlenecks.',
      employmentType: 'full_time',
      workMode: 'hybrid',
      urgency: 'high',
      neededByDate: '2025-03-15',
    },
    jobDetailsForm: {
      jobTitle: 'Senior Software Engineer',
      location: 'Addis Ababa, Ethiopia',
      workMode: 'hybrid',
      employmentType: 'full_time',
      jobSummary:
        'Own backend platform delivery and help the engineering team scale critical product systems.',
      whyJoinUs:
        'Work on high-impact systems with a product team shipping quickly across multiple business functions.',
      keyResponsibilities: [
        'Design and maintain backend services',
        'Collaborate with product and frontend teams',
        'Improve system reliability and performance',
      ],
      requirements: ['TypeScript', 'Node.js', 'System Design', 'AWS'],
      preferredSkills: ['Kubernetes', 'CI/CD', 'Observability'],
      experienceLevel: 'senior',
      salaryMode: 'range',
      salaryRangeMin: '3000',
      salaryRangeMax: '4200',
      salaryCurrency: 'USD',
      benefits: ['Health insurance', 'Learning budget', 'Hybrid work support'],
    },
    applicationForm: {
      predefinedFields: [
        {
          key: 'full_name',
          label: 'Full Name',
          type: 'text',
          enabled: true,
          required: true,
        },
        {
          key: 'email',
          label: 'Email Address',
          type: 'text',
          enabled: true,
          required: true,
        },
        {
          key: 'resume',
          label: 'Resume / CV',
          type: 'file',
          enabled: true,
          required: true,
        },
      ],
      customFields: [
        {
          id: 'cf-1',
          label: 'Github Profile',
          type: 'text',
          required: false,
          helpText: '',
          options: [],
        },
      ],
    },
  },
  {
    status: 'pending',
    progress: {
      jm: {
        status: 'requested_review',
        justification: 'Clarify ownership scope and budget assumptions.',
      },
      hr: { status: 'pending' },
      finance: { status: 'pending' },
    },
    requestForm: {
      jobTitle: 'Product Manager',
      department: 'technical',
      requestedBy: 'Mercy Wanjiku',
      position: 'product_manager',
      requestType: 'replacement',
      replaceFor: 'emp-mercy-wanjiku',
      businessJustification:
        'Own roadmap execution for HR automation initiatives and align product delivery across cross-functional teams.',
      employmentType: 'full_time',
      workMode: 'on_site',
      urgency: 'medium',
      neededByDate: '2025-04-01',
    },
    jobDetailsForm: {
      jobTitle: 'Product Manager',
      location: 'Nairobi, Kenya',
      workMode: 'on_site',
      employmentType: 'full_time',
      jobSummary:
        'Lead roadmap planning and execution for internal product initiatives across HR and operations.',
      whyJoinUs:
        'Drive visible process transformation and partner with cross-functional teams building internal tools.',
      keyResponsibilities: [
        'Define roadmap priorities',
        'Coordinate delivery across functions',
        'Own product outcomes and adoption',
      ],
      requirements: [
        'Product Strategy',
        'Stakeholder Management',
        'Agile',
        'Data Analysis',
      ],
      preferredSkills: ['Workflow automation', 'SaaS metrics'],
      experienceLevel: 'mid',
      salaryMode: 'competitive',
      salaryRangeMin: '',
      salaryRangeMax: '',
      salaryCurrency: '',
      benefits: ['Medical cover', 'Professional development'],
    },
    applicationForm: {
      predefinedFields: [
        {
          key: 'full_name',
          label: 'Full Name',
          type: 'text',
          enabled: true,
          required: true,
        },
        {
          key: 'email',
          label: 'Email Address',
          type: 'text',
          enabled: true,
          required: true,
        },
        {
          key: 'resume',
          label: 'Resume / CV',
          type: 'file',
          enabled: true,
          required: true,
        },
        {
          key: 'cover_letter',
          label: 'Cover Letter',
          type: 'textarea',
          enabled: true,
          required: false,
        },
      ],
      customFields: [],
    },
  },

  {
    status: 'pending',
    progress: {
      jm: { status: 'approved' },
      hr: { status: 'approved' },
      finance: { status: 'approved' },
    },
    requestForm: {
      jobTitle: 'Data Analyst',
      department: 'digital_marketing',
      requestedBy: 'Kevin Kiptoo',
      position: 'data_analyst',
      requestType: 'new',
      replaceFor: '',
      businessJustification:
        'Strengthen campaign reporting and attribution analysis to improve budget allocation and lead quality.',
      employmentType: 'part_time',
      workMode: 'remote',
      urgency: 'low',
      neededByDate: '2025-03-28',
    },
    jobDetailsForm: {
      jobTitle: 'Data Analyst',
      location: 'Remote',
      workMode: 'remote',
      employmentType: 'part_time',
      jobSummary:
        'Support campaign measurement and reporting with clear analysis and operational dashboards.',
      whyJoinUs: '',
      keyResponsibilities: [
        'Track marketing performance',
        'Build campaign dashboards',
        'Support data-driven budget decisions',
      ],
      requirements: ['SQL', 'Excel', 'Power BI', 'Marketing Analytics'],
      preferredSkills: ['Attribution modeling'],
      experienceLevel: 'mid',
      salaryMode: 'not_specified',
      salaryRangeMin: '',
      salaryRangeMax: '',
      salaryCurrency: '',
      benefits: [],
    },
    applicationForm: {
      predefinedFields: [
        {
          key: 'full_name',
          label: 'Full Name',
          type: 'text',
          enabled: true,
          required: true,
        },
        {
          key: 'email',
          label: 'Email Address',
          type: 'text',
          enabled: true,
          required: true,
        },
        {
          key: 'resume',
          label: 'Resume / CV',
          type: 'file',
          enabled: true,
          required: true,
        },
      ],
      customFields: [
        {
          id: 'cf-3',
          label: 'Power BI sample link',
          type: 'text',
          required: false,
          helpText: '',
          options: [],
        },
      ],
    },
  },
];

export const requestStats: RequestsStatItem[] = [
  { id: 'rs-1', label: 'Pending Requests', value: '12', icon: 'pending' },
  { id: 'rs-2', label: 'Approved This Month', value: '28', icon: 'approved' },
  {
    id: 'rs-3',
    label: 'Total Open Positions',
    value: '45',
    icon: 'open_positions',
  },
];

export const emptyRequestsMessage = 'No jobs requested.';
