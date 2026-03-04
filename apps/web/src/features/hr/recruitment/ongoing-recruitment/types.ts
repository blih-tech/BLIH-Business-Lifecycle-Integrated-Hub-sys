export type OngoingInterviewStatus = "interviewed" | "scheduled";

export type OngoingInterviewApplicant = {
  id: string;
  fullName: string;
  phone: string;
  interviewStatus: OngoingInterviewStatus;
  interviewDate?: string;
  interviewTime?: string;
  appliedAt: string;
  rating: number;
};

export type OngoingTopMatch = {
  fullName: string;
  phone: string;
  experience: string;
  salaryExpectation: string;
  canStart: string;
  matchScore: number;
};

export type OngoingPipelineCandidate = {
  id: string;
  fullName: string;
  phone: string;
  listedAt: string;
  rating: number;
};

export type OngoingRecruitmentJob = {
  id: string;
  title: string;
  statusLabel: string;
  department: string;
  interviewedCount: number;
  onInterviewCount: number;
  shortlistedCount: number;
  waitlistedCount: number;
  topMatch: OngoingTopMatch;
  interviews: OngoingInterviewApplicant[];
  shortlisted: OngoingPipelineCandidate[];
  waitlisted: OngoingPipelineCandidate[];
};
