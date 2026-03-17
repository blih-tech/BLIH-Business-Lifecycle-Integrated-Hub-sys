export type AttendanceRequestStat = {
  id: string;
  label: string;
  value: string;
  icon: "clock-3" | "circle-check-big";
};

export type LeaveRequestStatus = "completed" | "sick" | "annual";

export type LeaveRequestCardItem = {
  id: string;
  employeeName: string;
  employeeInitials: string;
  role: string;
  status: LeaveRequestStatus;
  from: string;
  to: string;
  duration: string;
  submittedTime: string;
  submittedDate: string;
  reason: string;
};

export type PreviousLeaveRow = {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: string;
  leaveType: "Sick" | "Annual" | "Emergency";
  email: string;
  phone: string;
  from: string;
  to: string;
  duration: string;
  submittedTime: string;
  submittedDate: string;
  reason: string;
  approvedBy: {
    name: string;
    initials: string;
    role: string;
    deptLabel: "TECHNICAL DEPT." | "CREATIVE DEPT.";
  }[];
  documents: string[];
};
