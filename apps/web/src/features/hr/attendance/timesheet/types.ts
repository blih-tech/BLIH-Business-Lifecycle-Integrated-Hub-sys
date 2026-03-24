export type TimesheetViewMode = 'daily' | 'weekly' | 'monthly';

export type TimesheetStatus = 'on-track' | 'overtime' | 'on-leave';

export type TimesheetSort = 'name-asc' | 'name-desc';

export type TimesheetMetrics = {
  hoursPerWeek: string;
  hoursPerMonth: string;
  overtime: string;
  leaveHours: string;
  billableHours: string;
};

export type TimesheetRow = {
  id: string;
  employeeId: string;
  name: string;
  initials: string;
  department: string;
  status: TimesheetStatus;
  metrics: TimesheetMetrics;
};

export type TimesheetSection = {
  id: string;
  title: string;
  subtitle?: string;
  railLabel?: string;
  rows: TimesheetRow[];
};

export type AttendanceTimesheetStatItem = {
  id: string;
  label: string;
  value: string;
  icon: 'clock-3' | 'circle-check-big';
};
