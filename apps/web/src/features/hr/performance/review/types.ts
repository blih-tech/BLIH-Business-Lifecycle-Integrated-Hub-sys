export type ReviewStatus = 'completed' | 'in-progress';

export type ReviewRow = {
  id: string;
  name: string;
  initials: string;
  department: string;
  leaveType: string;
  gender: string;
  resultGroup: string;
  kpi: number;
  okr: number;
  score: number;
  status: ReviewStatus;
};
