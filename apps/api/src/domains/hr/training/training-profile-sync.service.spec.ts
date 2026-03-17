import { TrainingProfileSyncService } from './training-profile-sync.service';

describe('TrainingProfileSyncService', () => {
  it('upserts acquired skills and marks the completion as synced', async () => {
    const prisma = {
      skill: {
        findUnique: jest.fn().mockResolvedValue({ id: 'skill-1' }),
      },
      employeeSkill: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue({}),
      },
      trainingCompletion: {
        update: jest.fn().mockResolvedValue({}),
      },
    };

    const service = new TrainingProfileSyncService(prisma as never);

    await service.syncCompletionSkills({
      completionId: 'completion-1',
      employeeId: 'employee-1',
      skillsAcquired: [{ skillId: 'skill-1', levelGain: 'ADVANCED' }],
      attestedAt: new Date('2026-03-01T00:00:00.000Z'),
    });

    expect(prisma.employeeSkill.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          skillId: 'skill-1',
          source: 'TRAINING',
          level: 'ADVANCED',
        }),
      }),
    );
    expect(prisma.trainingCompletion.update).toHaveBeenCalledWith({
      where: { id: 'completion-1' },
      data: { syncedToProfile: true },
    });
  });
});
