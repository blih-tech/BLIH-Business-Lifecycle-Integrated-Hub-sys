type CandidateRow = {
  id: string;
  candidateId: string;
  jobPostingId: string;
  jobPosting?: {
    postingId: string;
    position?: {
      title: string;
    } | null;
  } | null;
  source: 'COMPANY_SITE' | 'LINKEDIN' | 'TELEGRAM' | 'REFERRAL' | 'AGENCY';
  referralUserId: string | null;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  personalInfo: unknown;
  career: unknown;
  applicationResponses: unknown;
  status:
    | 'NEW'
    | 'SCREENING'
    | 'SHORTLISTED'
    | 'INTERVIEW_STAGE'
    | 'OFFER_PENDING'
    | 'HIRED'
    | 'REJECTED'
    | 'WITHDRAWN';
  pipeline: unknown;
  rejection: unknown;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    cvScreenings?: number;
    interviewFeedback?: number;
  };
};

export function mapCandidateResponse(row: CandidateRow) {
  return {
    id: row.id,
    candidateId: row.candidateId,
    jobPostingId: row.jobPostingId,
    jobPostingTitle:
      row.jobPosting?.position?.title ?? row.jobPosting?.postingId ?? null,
    source: row.source,
    referralUserId: row.referralUserId,
    email: row.email,
    phone: row.phone,
    firstName: row.firstName,
    lastName: row.lastName,
    personalInfo: row.personalInfo,
    career: row.career,
    applicationResponses: row.applicationResponses,
    status: row.status,
    pipeline: row.pipeline,
    rejection: row.rejection,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    screeningsCount: row._count?.cvScreenings ?? 0,
    interviewFeedbackCount: row._count?.interviewFeedback ?? 0,
  };
}
