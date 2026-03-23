export type AttendanceOvertimeStat = {
  id: string;
  label: string;
  value: string;
  icon: 'clock-3' | 'circle-check-big';
};

export type OvertimeRequestStatus = 'accepted' | 'rejected';

export type OvertimeRequestCardItem = {
  id: string;
  employeeName: string;
  employeeInitials: string;
  role: string;
  status: OvertimeRequestStatus;
  from: string;
  to: string;
  totalHours: string;
  submittedTime: string;
  submittedDate: string;
  reason: string;
};

export type PreviousOvertimeRow = {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: string;
  status: 'Accepted' | 'Rejected';
  email: string;
  phone: string;
  from: string;
  to: string;
  totalHours: string;
  submittedTime: string;
  submittedDate: string;
  reason: string;
  approvedBy: {
    name: string;
    initials: string;
    role: string;
    deptLabel: 'TECHNICAL DEPT.' | 'CREATIVE DEPT.';
  }[];
};
