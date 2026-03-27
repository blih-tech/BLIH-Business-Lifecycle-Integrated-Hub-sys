export type AttendanceMemoStat = {
  id: string;
  label: string;
  value: string;
  icon: "clock-3" | "circle-check-big";
};

export type MemoType = "Technical Issue" | "Emergency";

export type MemoCardItem = {
  id: string;
  employeeName: string;
  employeeInitials: string;
  role: string;
  memoType: MemoType;
  from: string;
  to: string;
  duration: string;
  submittedTime: string;
  submittedDate: string;
  title: string;
  description: string;
  secondaryAction: "Report Issue" | "View Profile";
};

export type PreviousMemoRow = {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: string;
  memoType: MemoType;
  email: string;
  phone: string;
  from: string;
  to: string;
  duration: string;
  submittedTime: string;
  submittedDate: string;
  title: string;
  description: string;
  approvedBy: {
    name: string;
    initials: string;
    role: string;
    deptLabel: "TECHNICAL DEPT." | "CREATIVE DEPT.";
  }[];
};
