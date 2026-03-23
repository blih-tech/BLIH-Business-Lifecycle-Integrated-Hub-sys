import type {
  AttendanceCheckinStatItem,
  CheckinSection,
  CheckinStatus,
  CheckinStamps,
} from '@/features/hr/attendance/check-in/types';

type EmployeeSeed = {
  id: string;
  name: string;
  initials: string;
  department: 'Marketing' | 'Finance' | 'Technology';
};

const employees: EmployeeSeed[] = [
  {
    id: 'emp-1',
    name: 'Jessica Parker',
    initials: 'JP',
    department: 'Marketing',
  },
  { id: 'emp-2', name: 'James Price', initials: 'JP', department: 'Finance' },
  {
    id: 'emp-3',
    name: 'Joan Peters',
    initials: 'JP',
    department: 'Technology',
  },
  {
    id: 'emp-4',
    name: 'Jaden Porter',
    initials: 'JP',
    department: 'Marketing',
  },
  { id: 'emp-5', name: 'Julia Pratt', initials: 'JP', department: 'Marketing' },
  {
    id: 'emp-6',
    name: 'Jeremy Pike',
    initials: 'JP',
    department: 'Technology',
  },
  {
    id: 'emp-7',
    name: 'Jasmine Prince',
    initials: 'JP',
    department: 'Finance',
  },
  { id: 'emp-8', name: 'Jonah Page', initials: 'JP', department: 'Marketing' },
];

const completedStamps: CheckinStamps = {
  morIn: '09:30 AM',
  lunOut: '12:30 PM',
  lunIn: '01:30 PM',
  aftOut: '05:30 PM',
};

const inProgressStamps: CheckinStamps = {
  morIn: '09:30 AM',
  lunOut: '12:30 PM',
  lunIn: 'Missed',
  aftOut: null,
};

const missedStamps: CheckinStamps = {
  morIn: 'Missed',
  lunOut: null,
  lunIn: null,
  aftOut: null,
};

function buildRows(seed: string) {
  const statuses: CheckinStatus[] = [
    'completed',
    'completed',
    'in-progress',
    'completed',
    'missed',
    'completed',
    'in-progress',
    'completed',
  ];

  return employees.map((employee, index) => {
    const status = statuses[index] ?? 'completed';
    const stamps =
      status === 'completed'
        ? completedStamps
        : status === 'in-progress'
          ? inProgressStamps
          : missedStamps;

    return {
      id: `${seed}-${employee.id}`,
      employeeId: employee.id,
      name: employee.name,
      initials: employee.initials,
      department: employee.department,
      status,
      stamps,
    };
  });
}

export const attendanceCheckinStats: AttendanceCheckinStatItem[] = [
  { id: 'in-progress', label: 'In Progress', value: '12', icon: 'clock-3' },
  {
    id: 'total-checkins',
    label: 'Total Check-ins',
    value: '28',
    icon: 'circle-check-big',
  },
  {
    id: 'completed',
    label: 'Completed',
    value: '45',
    icon: 'circle-check-big',
  },
];

export const dailyDateOptions = [
  { value: '2025-12-14', label: 'Tuesday, Dec 14, 2025' },
  { value: '2025-12-15', label: 'Wednesday, Dec 15, 2025' },
  { value: '2025-12-16', label: 'Thursday, Dec 16, 2025' },
  { value: '2025-12-17', label: 'Friday, Dec 17, 2025' },
] as const;

export const dailyRowsByDate = {
  '2025-12-14': buildRows('daily-2025-12-14'),
  '2025-12-15': buildRows('daily-2025-12-15'),
  '2025-12-16': buildRows('daily-2025-12-16'),
  '2025-12-17': buildRows('daily-2025-12-17'),
} as const;

export const weeklySections: CheckinSection[] = [
  { id: 'week-mon', title: 'Monday', rows: buildRows('week-mon') },
  { id: 'week-tue', title: 'Tuesday', rows: buildRows('week-tue') },
  { id: 'week-wed', title: 'Wednesday', rows: buildRows('week-wed') },
  { id: 'week-thu', title: 'Thursday', rows: buildRows('week-thu') },
  { id: 'week-fri', title: 'Friday', rows: buildRows('week-fri') },
];

export const monthlySections: CheckinSection[] = [
  {
    id: 'month-w1',
    title: 'Monday',
    subtitle: 'Tuesday, Nov 14, 2025 - Monday, Nov 21, 2025',
    railLabel: 'W1',
    rows: buildRows('month-w1'),
  },
  {
    id: 'month-w2',
    title: 'Monday',
    subtitle: 'Tuesday, Nov 22, 2025 - Monday, Nov 28, 2025',
    railLabel: 'W2',
    rows: buildRows('month-w2'),
  },
  {
    id: 'month-w3',
    title: 'Monday',
    subtitle: 'Tuesday, Nov 29, 2025 - Monday, Dec 05, 2025',
    railLabel: 'W3',
    rows: buildRows('month-w3'),
  },
  {
    id: 'month-w4',
    title: 'Monday',
    subtitle: 'Tuesday, Dec 06, 2025 - Monday, Dec 12, 2025',
    railLabel: 'W4',
    rows: buildRows('month-w4'),
  },
  {
    id: 'month-w5',
    title: 'Monday',
    subtitle: 'Tuesday, Dec 13, 2025 - Monday, Dec 21, 2025',
    railLabel: 'W5',
    rows: buildRows('month-w5'),
  },
];

export const checkinDepartments = [
  'all',
  'Marketing',
  'Finance',
  'Technology',
] as const;

export const checkinStatusOptions = [
  'all',
  'completed',
  'in-progress',
  'missed',
] as const;
