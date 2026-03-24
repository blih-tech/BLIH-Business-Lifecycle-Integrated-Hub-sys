export type BenefitsStat = {
  id: string;
  label: string;
  value: string;
  trend: string;
  icon: 'total' | 'average' | 'enrollments';
};

export type ProfitSharingSummary = {
  id: string;
  label: string;
  value: string;
};

export type ProfitSharingTier = {
  id: string;
  label: string;
  employees: string;
  amount: string;
  average: string;
  utilization: number;
};

export type PerformanceBonusSummary = {
  id: string;
  label: string;
  value: string;
};

export type TopRecipient = {
  id: string;
  initials: string;
  name: string;
  note: string;
  amount: string;
};

export type BenefitsProgram = {
  id: string;
  title: string;
  budget: string;
  participants: string;
};

export type MonthlyAllowanceItem = {
  id: string;
  title: string;
  budget: string;
  employees: string;
  perEmployee: string;
  utilization: number;
};

export type InsuranceBenefitItem = {
  id: string;
  title: string;
  subtitle: string;
  monthlyCost: string;
  employerShare: string;
  employeeShare: string;
  enrolled: string;
};

export type RetirementBenefitMetric = {
  id: string;
  label: string;
  value: string;
  accent?: boolean;
};

export type AdditionalBenefitItem = {
  id: string;
  title: string;
  budget: string;
  participants: string;
};

export type DepartmentBenefitPoint = {
  department: string;
  value: number;
};

export type DepartmentBenefitSummary = {
  id: string;
  department: string;
  employees: string;
  average: string;
};
