import type {
  ExitResignRequestItem,
  ExitResignStatItem,
} from '@/features/hr/exit/resign/types';

export const exitResignStats: ExitResignStatItem[] = [
  {
    id: 'total-received',
    label: 'Total Received',
    value: '3',
    icon: 'received',
  },
  {
    id: 'pending-approval',
    label: 'Pending Approval',
    value: '1',
    icon: 'pending',
  },
  { id: 'approved', label: 'Approved', value: '2', icon: 'approved' },
  { id: 'this-month', label: 'This Month', value: '3', icon: 'month' },
];

const firstLetter = `Dear HR Manager,

I am writing to formally notify you of my resignation from my position as Marketing Manager at the company. My last working day will be March 20, 2024, providing the required 30 days' notice.

I have accepted a position at another company that aligns with my long-term career goals and offers opportunities for professional growth.

I am grateful for the opportunities I've had during my time here and the support from my colleagues. I am committed to ensuring a smooth transition and will assist in training my replacement.

Thank you for understanding.

Sincerely,
Sarah Johnson`;

const secondLetter = `Dear HR Department,

I am writing to inform you of my decision to resign from my position as Senior Engineer. My last day of work will be March 12, 2024.

Due to family circumstances, I will be relocating to another city and unfortunately cannot continue my employment with the company.

I want to express my gratitude for the valuable experience and professional development opportunities I've received during my tenure.

Best regards,
Michael Chen`;

export const exitResignRequests: ExitResignRequestItem[] = [
  {
    id: 'resign-1',
    initials: 'SJ',
    name: 'Sarah Johnson',
    department: 'Marketing',
    status: 'pending',
    role: 'Marketing Manager',
    meta: [
      { id: 'submitted-date', label: 'Submitted Date', value: '2024-02-18' },
      {
        id: 'last-working-day',
        label: 'Last Working Day',
        value: '2024-03-20',
      },
      { id: 'notice-period', label: 'Notice Period', value: '30 days' },
      { id: 'reason', label: 'Reason', value: 'Better career opportunity' },
    ],
    letterTitle: 'Resignation Letter',
    letterBody: firstLetter,
  },
  {
    id: 'resign-2',
    initials: 'SJ',
    name: 'Sarah Johnson',
    department: 'Marketing',
    status: 'pending',
    role: 'Marketing Manager',
    meta: [
      { id: 'submitted-date', label: 'Submitted Date', value: '2024-02-18' },
      {
        id: 'last-working-day',
        label: 'Last Working Day',
        value: '2024-03-20',
      },
      { id: 'notice-period', label: 'Notice Period', value: '30 days' },
      { id: 'reason', label: 'Reason', value: 'Better career opportunity' },
    ],
    letterTitle: 'Resignation Letter',
    letterBody: firstLetter,
  },
  {
    id: 'resign-3',
    initials: 'MC',
    name: 'Michael Chen',
    department: 'Engineering',
    status: 'approved',
    role: 'Marketing Manager',
    meta: [
      { id: 'submitted-date', label: 'Submitted Date', value: '2024-02-18' },
      {
        id: 'last-working-day',
        label: 'Last Working Day',
        value: '2024-03-20',
      },
      { id: 'notice-period', label: 'Notice Period', value: '30 days' },
      { id: 'reason', label: 'Reason', value: 'Better career opportunity' },
    ],
    letterTitle: 'Resignation Letter',
    letterBody: secondLetter,
  },
];
