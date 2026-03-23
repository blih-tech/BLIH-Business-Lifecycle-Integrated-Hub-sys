import type {
  CultureImpactMetric,
  CultureInitiative,
  CulturePolicy,
} from '@/features/hr/talent/culture/types';

export const culturePolicies: CulturePolicy[] = [
  {
    id: 'policy-1',
    title: 'Company Values & Mission',
    description:
      'Our core values guide everything we do, from hiring to daily operations.',
    updatedAt: '2024-01-15',
    icon: 'shield',
  },
  {
    id: 'policy-2',
    title: 'Code of Conduct',
    description:
      'Professional standards and behavioral expectations for all employees.',
    updatedAt: '2024-02-01',
    icon: 'badge',
  },
  {
    id: 'policy-3',
    title: 'Diversity & Inclusion Policy',
    description:
      'Our commitment to creating an inclusive workplace for everyone.',
    updatedAt: '2024-01-20',
    icon: 'users',
  },
  {
    id: 'policy-4',
    title: 'Work-Life Balance Guidelines',
    description:
      'Policies supporting employee wellbeing and flexible work arrangements.',
    updatedAt: '2024-02-10',
    icon: 'zap',
  },
];

const innovationFridays: CultureInitiative = {
  id: 'initiative-1',
  title: 'Innovation Fridays',
  status: 'active',
  description:
    'Dedicated time every Friday afternoon for employees to work on passion projects and innovative ideas.',
  timeline: 'Ongoing - Started Jan 2024',
  assignedTo: 'Engineering & Product Teams',
  participantsCount: 45,
  participantInitials: ['JS', 'SJ', 'MB', 'ER'],
  extraParticipants: 41,
};

const wellnessWednesdays: CultureInitiative = {
  id: 'initiative-2',
  title: 'Wellness Wednesdays',
  status: 'active',
  description:
    'Weekly wellness activities including yoga, meditation, and health workshops to promote employee wellbeing.',
  timeline: 'Ongoing - Started Feb 2024',
  assignedTo: 'All Departments',
  participantsCount: 120,
  participantInitials: ['SL', 'DL', 'LM', 'TA'],
  extraParticipants: 116,
};

export const activeCultureInitiatives: CultureInitiative[] = [
  innovationFridays,
  wellnessWednesdays,
  { ...innovationFridays, id: 'initiative-3' },
  { ...wellnessWednesdays, id: 'initiative-4' },
];

export const cultureImpactMetrics: CultureImpactMetric[] = [
  { id: 'metric-1', label: 'Employee Satisfaction', value: '92%' },
  { id: 'metric-2', label: 'Total Participants', value: '465' },
  { id: 'metric-3', label: 'Active Programs', value: '6' },
  { id: 'metric-4', label: 'Participation Rate', value: '88%' },
];
