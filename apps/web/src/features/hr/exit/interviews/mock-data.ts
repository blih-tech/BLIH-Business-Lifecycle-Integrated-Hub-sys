import type {
  CompletedInterview,
  ExitInterviewStat,
  UpcomingInterview,
} from '@/features/hr/exit/interviews/types';

export const exitInterviewStats: ExitInterviewStat[] = [
  { id: 'scheduled', label: 'Scheduled', value: '3', icon: 'scheduled' },
  { id: 'avg-rating', label: 'Avg Rating', value: '4.2/5.0', icon: 'rating' },
  { id: 'completed', label: 'Completed', value: '3', icon: 'completed' },
];

export const upcomingExitInterviews: UpcomingInterview[] = [
  {
    id: 'upcoming-1',
    initials: 'SJ',
    name: 'Sarah Johnson',
    role: 'Marketing Manager',
    department: 'Marketing',
    status: 'scheduled',
    date: '2024-02-22',
    time: '10:00 AM',
    interviewer: 'Jennifer Smith',
    location: 'Conference Room A',
  },
  {
    id: 'upcoming-2',
    initials: 'SJ',
    name: 'Sarah Johnson',
    role: 'Marketing Manager',
    department: 'Marketing',
    status: 'scheduled',
    date: '2024-02-22',
    time: '10:00 AM',
    interviewer: 'Jennifer Smith',
    location: 'Conference Room A',
  },
];

const remarksText =
  'Employee leaving for better compensation. Suggested reviewing salary benchmarks for engineering roles.';

export const completedExitInterviews: CompletedInterview[] = [
  {
    id: 'completed-1',
    initials: 'JP',
    name: 'Jessica Parker',
    role: 'Full Stack Developer',
    department: 'Technical Dept.',
    interviewDate: '2024-02-15',
    interviewer: 'Jennifer Smith',
    rating: '4.2/5.0',
    wouldRecommend: 'Yes',
    remarks: remarksText,
  },
  {
    id: 'completed-2',
    initials: 'JP',
    name: 'Jessica Parker',
    role: 'Full Stack Developer',
    department: 'Technical Dept.',
    interviewDate: '2024-02-15',
    interviewer: 'Jennifer Smith',
    rating: '4.2/5.0',
    wouldRecommend: 'Yes',
    remarks: remarksText,
  },
  {
    id: 'completed-3',
    initials: 'JP',
    name: 'Jessica Parker',
    role: 'Full Stack Developer',
    department: 'Technical Dept.',
    interviewDate: '2024-02-15',
    interviewer: 'Jennifer Smith',
    rating: '4.2/5.0',
    wouldRecommend: 'Yes',
    remarks: remarksText,
  },
];
