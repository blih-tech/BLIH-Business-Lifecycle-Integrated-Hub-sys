export type ExitDocumentsStat = {
  id: string;
  label: string;
  value: string;
  icon: 'employees' | 'cleared' | 'progress';
};

export type ClearanceDocumentItem = {
  id: string;
  label: string;
};

export type EmployeeClearanceItem = {
  id: string;
  initials: string;
  name: string;
  role: string;
  department: string;
  lastWorkingDay: string;
  documents: ClearanceDocumentItem[];
  progressText: string;
  progressTasks: string;
};

export type DocumentTemplateItem = {
  id: string;
  title: string;
  description: string;
};

export type RecentlyClearedItem = {
  id: string;
  initials: string;
  name: string;
  clearedBy: string;
  date: string;
};
