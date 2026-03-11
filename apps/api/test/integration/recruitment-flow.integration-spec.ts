import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UpdateApplicantStatusUseCase } from '../../src/domains/hr/recruitment/use-cases/applicants.usecases';
import {
  UpdateInterviewParticipantAttendanceUseCase,
  UpdateInterviewUseCase,
  UpsertInterviewFeedbackUseCase,
} from '../../src/domains/hr/recruitment/use-cases/interviews.usecases';

describe('Recruitment flow (integration)', () => {
  it('rejects invalid applicant status transitions', async () => {
    const prisma = {
      applicant: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'app-1',
          status: 'APPLIED',
          jobId: 'job-1',
        }),
      },
    };

    const usecase = new UpdateApplicantStatusUseCase(prisma as never);
    await expect(
      usecase.execute('app-1', { status: 'HIRED' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects invalid interview status transitions', async () => {
    const prisma = {
      interviewSession: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'session-1',
          status: 'COMPLETED',
          jobId: 'job-1',
          round: 1,
          participants: [],
          interviewers: [],
        }),
      },
    };

    const usecase = new UpdateInterviewUseCase(prisma as never);
    await expect(
      usecase.execute('session-1', { status: 'SCHEDULED' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects invalid interview attendance transitions', async () => {
    const prisma = {
      interviewParticipant: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'participant-1',
          sessionId: 'session-1',
          applicantId: 'applicant-1',
          attendanceStatus: 'COMPLETED',
          session: { id: 'session-1', jobId: 'job-1' },
        }),
      },
    };

    const usecase = new UpdateInterviewParticipantAttendanceUseCase(
      prisma as never,
    );

    await expect(
      usecase.execute('session-1', 'participant-1', {
        attendanceStatus: 'ATTENDING',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('blocks feedback from interviewer not assigned to session', async () => {
    const prisma = {
      interviewParticipant: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'participant-1',
          applicantId: 'applicant-1',
        }),
      },
      interviewerAssignment: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };

    const usecase = new UpsertInterviewFeedbackUseCase(prisma as never);

    await expect(
      usecase.execute('session-1', 'participant-1', 'user-1', { score: 84 }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
