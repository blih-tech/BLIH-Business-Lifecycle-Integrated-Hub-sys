import { TrainingCertificationService } from './training-certification.service';

describe('TrainingCertificationService', () => {
  it('classifies certifications by expiry status and filters the list', async () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 10);

    const prisma = {
      trainingCompletion: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'completion-1',
            employeeId: 'employee-1',
            trainingRequestId: null,
            title: 'Security Awareness',
            provider: 'BLIH Academy',
            completionStatus: 'COMPLETED',
            certificateNumber: 'CERT-1',
            certificateUrl: null,
            endDate: new Date('2026-01-10T00:00:00.000Z'),
            expiryDate: soon,
            scoreOrGrade: null,
            skillsAcquired: [],
            syncedToProfile: true,
            createdAt: new Date('2026-01-10T00:00:00.000Z'),
            updatedAt: new Date('2026-01-10T00:00:00.000Z'),
          },
        ]),
      },
    };

    const service = new TrainingCertificationService(
      prisma as never,
      {} as never,
    );

    const result = await service.list({ status: 'EXPIRING_SOON' });

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('EXPIRING_SOON');
    expect(result[0].certificateNumber).toBe('CERT-1');
  });
});
