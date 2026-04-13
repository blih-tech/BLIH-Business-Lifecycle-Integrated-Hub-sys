export type ContractStatus =
  | 'TODO'
  | 'SUBMITTED'
  | 'CHANGES_REQUESTED'
  | 'COMPLETED';

export type EmploymentContract = {
  id: string;

  taskId: string;
  status: ContractStatus;

  name: string;
  role: string;
  department: string;
  avatarText: string;

  offerSentOn: string;
  roleSummary: string;
  responsibilities: string[];

  overview: {
    startDate: string;
    workHours: string;
    probationPeriod: string;
    salaryPayroll: string;
  };
};
