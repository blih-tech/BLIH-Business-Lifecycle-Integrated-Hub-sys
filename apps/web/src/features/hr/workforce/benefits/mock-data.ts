import type {
  BenefitsProgram,
  BenefitsStat,
  DepartmentBenefitPoint,
  DepartmentBenefitSummary,
  InsuranceBenefitItem,
  MonthlyAllowanceItem,
  RetirementBenefitMetric,
  PerformanceBonusSummary,
  ProfitSharingSummary,
  ProfitSharingTier,
  TopRecipient,
  AdditionalBenefitItem,
} from '@/features/hr/workforce/benefits/types';

export const benefitsStats: BenefitsStat[] = [
  {
    id: 'total',
    label: 'Total Benefits Value',
    value: '$2.85M',
    trend: '+12%',
    icon: 'total',
  },
  {
    id: 'average',
    label: 'Avg per Employee',
    value: '$18,269',
    trend: '+8%',
    icon: 'average',
  },
  {
    id: 'enrollments',
    label: 'Active Enrollments',
    value: '156',
    trend: '100%',
    icon: 'enrollments',
  },
];

export const profitSharingSummaries: ProfitSharingSummary[] = [
  { id: 'pool', label: 'Total Pool', value: '$450,000' },
  { id: 'eligible', label: 'Eligible Employees', value: '142' },
  { id: 'average', label: 'Avg per Employee', value: '$3,169' },
];

export const profitSharingTiers: ProfitSharingTier[] = [
  {
    id: 'exec',
    label: 'Executive',
    employees: '8 employees',
    amount: '$100,000',
    average: '$12,500 avg',
    utilization: 70,
  },
  {
    id: 'senior',
    label: 'Senior',
    employees: '28 employees',
    amount: '$140,000',
    average: '$5,000 avg',
    utilization: 62,
  },
  {
    id: 'mid',
    label: 'Mid-level',
    employees: '56 employees',
    amount: '$140,000',
    average: '$2,500 avg',
    utilization: 78,
  },
  {
    id: 'junior',
    label: 'Junior',
    employees: '50 employees',
    amount: '$70,000',
    average: '$1,400 avg',
    utilization: 66,
  },
];

export const performanceBonusSummaries: PerformanceBonusSummary[] = [
  { id: 'budget', label: 'Total Budget', value: '$320,000' },
  { id: 'paid', label: 'Paid Out', value: '$285,000' },
  { id: 'pending', label: 'Pending', value: '$35,000' },
];

export const topRecipients: TopRecipient[] = [
  {
    id: 'tr-1',
    initials: 'JS',
    name: 'John Smith',
    note: 'Outstanding technical leadership',
    amount: '$12,000',
  },
  {
    id: 'tr-2',
    initials: 'JS',
    name: 'John Smith',
    note: 'Outstanding technical leadership',
    amount: '$12,000',
  },
  {
    id: 'tr-3',
    initials: 'JS',
    name: 'John Smith',
    note: 'Outstanding technical leadership',
    amount: '$12,000',
  },
  {
    id: 'tr-4',
    initials: 'JS',
    name: 'John Smith',
    note: 'Outstanding technical leadership',
    amount: '$12,000',
  },
];

export const benefitsPrograms: BenefitsProgram[] = [
  {
    id: 'bp-1',
    title: 'Gym Membership',
    budget: '$42,000',
    participants: '95',
  },
  {
    id: 'bp-2',
    title: 'Childcare Assistance',
    budget: '$85,000',
    participants: '38',
  },
  {
    id: 'bp-3',
    title: 'Tuition Reimbursement',
    budget: '$120,000',
    participants: '24',
  },
  {
    id: 'bp-4',
    title: 'Employee Assistance Program',
    budget: '$35,000',
    participants: '156',
  },
];

export const monthlyAllowancesSummary = {
  label: 'Total Monthly Allowances',
  value: '$127,000',
};

export const monthlyAllowances: MonthlyAllowanceItem[] = [
  {
    id: 'ma-1',
    title: 'Transportation Allowance',
    budget: '$45,000',
    employees: '120',
    perEmployee: '$375',
    utilization: 95,
  },
  {
    id: 'ma-2',
    title: 'Meal Allowance',
    budget: '$36,000',
    employees: '156',
    perEmployee: '$230',
    utilization: 100,
  },
  {
    id: 'ma-3',
    title: 'Remote Work Stipend',
    budget: '$28,000',
    employees: '85',
    perEmployee: '$329',
    utilization: 88,
  },
  {
    id: 'ma-4',
    title: 'Phone & Internet',
    budget: '$18,000',
    employees: '156',
    perEmployee: '$115',
    utilization: 100,
  },
];

export const insuranceSummary = {
  label: 'Total Monthly Insurance Cost',
  value: '$171,500',
};

export const insuranceBenefits: InsuranceBenefitItem[] = [
  {
    id: 'ins-1',
    title: 'Health Insurance',
    subtitle: 'Medical, Dental, Vision',
    monthlyCost: '$125,000/mo',
    employerShare: '85%',
    employeeShare: '15%',
    enrolled: '152',
  },
  {
    id: 'ins-2',
    title: 'Health Insurance',
    subtitle: 'Medical, Dental, Vision',
    monthlyCost: '$125,000/mo',
    employerShare: '85%',
    employeeShare: '15%',
    enrolled: '152',
  },
];

export const retirementOverview = {
  title: '401(k) with Company Match',
  subtitle: '100% up to 6% of salary',
};

export const retirementMetrics: RetirementBenefitMetric[] = [
  { id: 'rb-1', label: 'Participants', value: '145' },
  { id: 'rb-2', label: 'Participation Rate', value: '93%' },
  { id: 'rb-3', label: 'Employer Match', value: '$93k', accent: true },
  { id: 'rb-4', label: 'Total Contributions', value: '$185k' },
];

export const additionalBenefits: AdditionalBenefitItem[] = [
  {
    id: 'ab-1',
    title: 'Professional Development',
    budget: '$150,000',
    participants: '89',
  },
  {
    id: 'ab-2',
    title: 'Wellness Programs',
    budget: '$75,000',
    participants: '120',
  },
  {
    id: 'ab-3',
    title: 'Gym Membership',
    budget: '$42,000',
    participants: '95',
  },
  {
    id: 'ab-4',
    title: 'Childcare Assistance',
    budget: '$85,000',
    participants: '38',
  },
  {
    id: 'ab-5',
    title: 'Tuition Reimbursement',
    budget: '$120,000',
    participants: '24',
  },
  {
    id: 'ab-6',
    title: 'Employee Assistance Program',
    budget: '$35,000',
    participants: '156',
  },
];

export const departmentBenefitPoints: DepartmentBenefitPoint[] = [
  { department: 'Engineering', value: 1000 },
  { department: 'Marketing', value: 550 },
  { department: 'Sales', value: 720 },
  { department: 'Design', value: 400 },
  { department: 'Analytics', value: 320 },
  { department: 'HR', value: 210 },
];

export const departmentBenefitSummaries: DepartmentBenefitSummary[] = [
  {
    id: 'db-1',
    department: 'Engineering',
    employees: '45 employees',
    average: '$19.9k avg',
  },
  {
    id: 'db-2',
    department: 'Marketing',
    employees: '28 employees',
    average: '$18.6k avg',
  },
  {
    id: 'db-3',
    department: 'Sales',
    employees: '32 employees',
    average: '$19.2k avg',
  },
  {
    id: 'db-4',
    department: 'Design',
    employees: '18 employees',
    average: '$19.2k avg',
  },
  {
    id: 'db-5',
    department: 'Analytics',
    employees: '15 employees',
    average: '$19.0k avg',
  },
  {
    id: 'db-6',
    department: 'HR',
    employees: '12 employees',
    average: '$15.8k avg',
  },
];
