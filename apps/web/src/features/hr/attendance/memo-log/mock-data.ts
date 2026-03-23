import type {
  AttendanceMemoStat,
  MemoCardItem,
  PreviousMemoRow,
} from '@/features/hr/attendance/memo-log/types';

export const attendanceMemoStats: AttendanceMemoStat[] = [
  {
    id: 'week-logs',
    label: 'Memo Logs This Week',
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
    id: 'total-memos',
    label: 'Total Memo Logs',
    value: '45',
    icon: 'circle-check-big',
  },
];

const memoDescription =
  'Biometric system failed to register check-in. Security guard confirmed arrival at 8:50 AM.';

const selectedMemoDescription =
  "We're looking for an experienced Frontend Developer to join our team and help build the next generation of our product platform.";

export const memoCards: MemoCardItem[] = [
  {
    id: 'memo-1',
    employeeName: 'Jessica Parker',
    employeeInitials: 'JP',
    role: 'Full Stack Developer',
    memoType: 'Technical Issue',
    from: '-',
    to: '-',
    duration: '30Min',
    submittedTime: '02:33 PM',
    submittedDate: 'Dec 30, 2025',
    title: 'I had a Check-in failure technical issue',
    description: memoDescription,
    secondaryAction: 'Report Issue',
  },
  {
    id: 'memo-2',
    employeeName: 'Jessica Parker',
    employeeInitials: 'JP',
    role: 'Full Stack Developer',
    memoType: 'Emergency',
    from: '02:33 PM Dec 30, 2025',
    to: '02:33 PM Dec 30, 2025',
    duration: '2Hrs',
    submittedTime: '02:33 PM',
    submittedDate: 'Dec 30, 2025',
    title: 'Unable to work on the project on emergency matters.',
    description: memoDescription,
    secondaryAction: 'View Profile',
  },
];

export const previousMemoRows: PreviousMemoRow[] = Array.from(
  { length: 10 },
  (_, index) => ({
    id: `pm-${index + 1}`,
    name: 'Jessica Parker',
    initials: 'JP',
    role: 'Full Stack Developer',
    department: 'Marketing',
    memoType: 'Technical Issue',
    email: 'jessica@company.com',
    phone: '+251 967 76 6353',
    from: '02:33 PM',
    to: '02:33 PM',
    duration: '2Hrs',
    submittedTime: '02:33 PM',
    submittedDate: 'Dec 30, 2025',
    title: 'Unable to work on the project on emergency matters.',
    description: selectedMemoDescription,
    approvedBy: [
      {
        name: 'Jessica Parker',
        initials: 'JP',
        role: 'Full Stack Developer',
        deptLabel: 'TECHNICAL DEPT.',
      },
    ],
  }),
);
