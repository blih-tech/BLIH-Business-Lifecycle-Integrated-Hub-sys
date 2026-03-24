import type {
  AttendanceOvertimeStat,
  OvertimeRequestCardItem,
  PreviousOvertimeRow,
} from '@/features/hr/attendance/overtime/types';

export const attendanceOvertimeStats: AttendanceOvertimeStat[] = [
  {
    id: 'wfh-month',
    label: 'Total WFH Requests This Month',
    value: '12',
    icon: 'clock-3',
  },
  {
    id: 'pending-approval',
    label: 'Pending Approval',
    value: '28',
    icon: 'clock-3',
  },
  {
    id: 'wfh-total',
    label: 'Total Work-From-Home Requests',
    value: '45',
    icon: 'circle-check-big',
  },
];

const reasonText =
  "We're looking for an experienced Frontend Developer to join our team and help build the next generation of our product platform.";

export const overtimeRequestCards: OvertimeRequestCardItem[] = [
  {
    id: 'or-1',
    employeeName: 'Jessica Parker',
    employeeInitials: 'JP',
    role: 'Full Stack Developer',
    status: 'accepted',
    from: '02:33 PM Dec 30, 2025',
    to: '02:33 PM Dec 30, 2025',
    totalHours: '2Days',
    submittedTime: '02:33 PM',
    submittedDate: 'Dec 30, 2025',
    reason: 'WFH for Marketing Campaign Planning',
  },
  {
    id: 'or-2',
    employeeName: 'Jessica Parker',
    employeeInitials: 'JP',
    role: 'Full Stack Developer',
    status: 'rejected',
    from: '02:33 PM Dec 30, 2025',
    to: '02:33 PM Dec 30, 2025',
    totalHours: '2Days',
    submittedTime: '02:33 PM',
    submittedDate: 'Dec 30, 2025',
    reason: 'Remote Work - Server Maintenance',
  },
];

export const previousOvertimeRows: PreviousOvertimeRow[] = Array.from(
  { length: 10 },
  (_, idx) => ({
    id: `po-${idx + 1}`,
    name: 'Jessica Parker',
    initials: 'JP',
    role: 'Full Stack Developer',
    department: 'Marketing',
    status: idx % 3 === 1 ? 'Rejected' : 'Accepted',
    email: 'jessica@company.com',
    phone: '+251 967 76 6353',
    from: '02:33 PM',
    to: '02:33 PM',
    totalHours: '2Days',
    submittedTime: '02:33 PM',
    submittedDate: 'Dec 30, 2025',
    reason: reasonText,
    approvedBy: [
      {
        name: 'Jessica Parker',
        initials: 'JP',
        role: 'Full Stack Developer',
        deptLabel: 'TECHNICAL DEPT.',
      },
      {
        name: 'Jessica Parker',
        initials: 'JP',
        role: 'Full Stack Developer',
        deptLabel: 'CREATIVE DEPT.',
      },
    ],
  }),
);
