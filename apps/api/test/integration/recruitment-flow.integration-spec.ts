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

  it('keeps feedback submission backward compatible without question responses', async () => {
    const now = new Date('2026-03-11T10:00:00.000Z');
    const tx = {
      interviewFeedback: {
        upsert: jest.fn().mockResolvedValue({
          id: 'feedback-1',
          participantId: 'participant-1',
          assignmentId: 'assignment-1',
          score: 84,
          endorsement: null,
          strengths: [],
          weaknesses: [],
          questionResponses: null,
          notes: null,
          isDraft: false,
          submittedAt: now,
          createdAt: now,
          updatedAt: now,
          assignment: { interviewerId: 'user-1' },
        }),
      },
      applicant: {
        update: jest.fn().mockResolvedValue(undefined),
      },
    };

    const prisma = {
      interviewParticipant: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'participant-1',
          applicantId: 'applicant-1',
        }),
      },
      interviewerAssignment: {
        findUnique: jest.fn().mockResolvedValue({ id: 'assignment-1' }),
      },
      interviewQuestion: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn().mockImplementation((callback) => callback(tx)),
    };

    const usecase = new UpsertInterviewFeedbackUseCase(prisma as never);
    const result = await usecase.execute(
      'session-1',
      'participant-1',
      'user-1',
      {
        score: 84,
        isDraft: false,
      },
    );

    expect(result.score).toBe(84);
    expect(result.questionResponses).toBeNull();
  });
});
