export type ExitInterviewStat = {
  id: string;
  label: string;
  value: string;
  icon: 'scheduled' | 'rating' | 'completed';
};

export type UpcomingInterview = {
  id: string;
  initials: string;
  name: string;
  role: string;
  department: string;
  status: 'scheduled';
  date: string;
  time: string;
  interviewer: string;
  location: string;
};

export type CompletedInterview = {
  id: string;
  initials: string;
  name: string;
  role: string;
  department: string;
  interviewDate: string;
  interviewer: string;
  rating: string;
  wouldRecommend: string;
  remarks: string;
};
