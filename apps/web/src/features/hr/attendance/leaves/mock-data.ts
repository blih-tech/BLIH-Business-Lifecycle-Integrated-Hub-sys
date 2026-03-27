import type {
  AttendanceRequestStat,
  LeaveRequestCardItem,
  PreviousLeaveRow,
} from "@/features/hr/attendance/leaves/types";

export const attendanceRequestStats: AttendanceRequestStat[] = [
  { id: "month-hours", label: "Avg Work Hours This Month", value: "12", icon: "clock-3" },
  { id: "week-hours", label: "Avg Work Hours This Week", value: "28", icon: "clock-3" },
  { id: "total-leaves", label: "Total Leaves", value: "45", icon: "circle-check-big" },
];

const reasonText =
  "We're looking for an experienced Frontend Developer to join our team and help build the next generation of our product platform.";

export const leaveRequestCards: LeaveRequestCardItem[] = [
  {
    id: "lr-1",
    employeeName: "Jessica Parker",
    employeeInitials: "JP",
    role: "Full Stack Developer",
    status: "completed",
    from: "Dec 30, 2025",
    to: "Dec 30, 2025",
    duration: "4Days",
    submittedTime: "02:33 PM",
    submittedDate: "Dec 30, 2025",
    reason: reasonText,
  },
  {
    id: "lr-2",
    employeeName: "Jessica Parker",
    employeeInitials: "JP",
    role: "Full Stack Developer",
    status: "sick",
    from: "Dec 30, 2025",
    to: "Dec 30, 2025",
    duration: "4Days",
    submittedTime: "02:33 PM",
    submittedDate: "Dec 30, 2025",
    reason: reasonText,
  },
  {
    id: "lr-3",
    employeeName: "Jessica Parker",
    employeeInitials: "JP",
    role: "Full Stack Developer",
    status: "annual",
    from: "Dec 30, 2025",
    to: "Dec 30, 2025",
    duration: "4Days",
    submittedTime: "02:33 PM",
    submittedDate: "Dec 30, 2025",
    reason: reasonText,
  },
];

export const previousLeaveRows: PreviousLeaveRow[] = Array.from({ length: 10 }, (_, idx) => ({
  id: `pl-${idx + 1}`,
  name: "Jessica Parker",
  initials: "JP",
  role: "Full Stack Developer",
  department: "Marketing",
  leaveType: "Sick",
  email: "jessica@company.com",
  phone: "+251 967 76 6353",
  from: "Dec 30, 2025",
  to: "Dec 30, 2025",
  duration: "4Days",
  submittedTime: "02:33 PM",
  submittedDate: "Dec 30, 2025",
  reason: reasonText,
  approvedBy: [
    {
      name: "Jessica Parker",
      initials: "JP",
      role: "Full Stack Developer",
      deptLabel: "TECHNICAL DEPT.",
    },
    {
      name: "Jessica Parker",
      initials: "JP",
      role: "Full Stack Developer",
      deptLabel: "CREATIVE DEPT.",
    },
  ],
  documents: ["Medical Paper", "Leave Letter"],
}));
