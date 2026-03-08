import { BadRequestException } from '@nestjs/common';
import { UpdateApplicantStatusUseCase } from '../../src/domains/hr/recruitment/use-cases/applicants.usecases';
import { UpdateInterviewUseCase } from '../../src/domains/hr/recruitment/use-cases/interviews.usecases';

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
      interview: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: 'interview-1',
          status: 'COMPLETED',
        }),
      },
    };

    const usecase = new UpdateInterviewUseCase(prisma as never);
    await expect(
      usecase.execute('interview-1', { status: 'SCHEDULED' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
