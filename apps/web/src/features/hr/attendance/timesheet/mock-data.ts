import type {
  AttendanceTimesheetStatItem,
  TimesheetMetrics,
  TimesheetSection,
  TimesheetStatus,
} from '@/features/hr/attendance/timesheet/types';

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

const onTrackMetrics: TimesheetMetrics = {
  hoursPerWeek: '42h',
  hoursPerMonth: '160h',
  overtime: '4h',
  leaveHours: '24h',
  billableHours: '156h',
};

const overtimeMetrics: TimesheetMetrics = {
  hoursPerWeek: '46h',
  hoursPerMonth: '172h',
  overtime: '8h',
  leaveHours: '8h',
  billableHours: '164h',
};

const onLeaveMetrics: TimesheetMetrics = {
  hoursPerWeek: '24h',
  hoursPerMonth: '104h',
  overtime: '0h',
  leaveHours: '36h',
  billableHours: '98h',
};

function buildRows(seed: string) {
  const statuses: TimesheetStatus[] = [
    'on-track',
    'on-track',
    'overtime',
    'on-track',
    'on-leave',
    'overtime',
    'on-track',
    'on-track',
  ];

  return employees.map((employee, index) => {
    const status = statuses[index] ?? 'on-track';
    const metrics =
      status === 'on-track'
        ? onTrackMetrics
        : status === 'overtime'
          ? overtimeMetrics
          : onLeaveMetrics;

    return {
      id: `${seed}-${employee.id}`,
      employeeId: employee.id,
      name: employee.name,
      initials: employee.initials,
      department: employee.department,
      status,
      metrics,
    };
  });
}

export const attendanceTimesheetStats: AttendanceTimesheetStatItem[] = [
  {
    id: 'avg-month',
    label: 'Avg Work Hours This Month',
    value: '12',
    icon: 'clock-3',
  },
  {
    id: 'avg-week',
    label: 'Avg Work Hours This Week',
    value: '28',
    icon: 'clock-3',
  },
  {
    id: 'total-leaves',
    label: 'Total Leaves',
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

export const weeklySections: TimesheetSection[] = [
  { id: 'week-mon', title: 'Monday', rows: buildRows('week-mon') },
  { id: 'week-tue', title: 'Tuesday', rows: buildRows('week-tue') },
  { id: 'week-wed', title: 'Wednesday', rows: buildRows('week-wed') },
  { id: 'week-thu', title: 'Thursday', rows: buildRows('week-thu') },
  { id: 'week-fri', title: 'Friday', rows: buildRows('week-fri') },
];

export const monthlySections: TimesheetSection[] = [
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

export const timesheetDepartments = [
  'all',
  'Marketing',
  'Finance',
  'Technology',
] as const;

export const timesheetStatusOptions = [
  'all',
  'on-track',
  'overtime',
  'on-leave',
] as const;
