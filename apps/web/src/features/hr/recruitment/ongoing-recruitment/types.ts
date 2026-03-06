export type OngoingInterviewStatus = "interviewed" | "scheduled";
export type OngoingInterviewDecisionStatus = "pending" | "waitlisted";

export type OngoingInterviewApplicant = {
  id: string;
  fullName: string;
  phone: string;
  interviewStatus: OngoingInterviewStatus;
  status: OngoingInterviewDecisionStatus;
  interviewDate?: string;
  interviewTime?: string;
  rating: number;
};

export type OngoingCommitteePerson = {
  id: string;
  fullName: string;
  role: string;
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
  interviewCommittee: OngoingCommitteePerson[];
  interviews: OngoingInterviewApplicant[];
  shortlisted: OngoingPipelineCandidate[];
  waitlisted: OngoingPipelineCandidate[];
};
