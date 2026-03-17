import { NotFoundException } from '@nestjs/common';
import { DeletePositionUseCase } from './delete-position.usecase';

describe('DeletePositionUseCase', () => {
  it('rejects when the position does not exist', async () => {
    const prisma = {
      position: {
        findUnique: jest.fn().mockResolvedValue(null),
        delete: jest.fn(),
      },
    };

    const useCase = new DeletePositionUseCase(prisma as never);

    await expect(useCase.execute('missing-position')).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.position.delete).not.toHaveBeenCalled();
  });

  it('deletes an existing position', async () => {
    const prisma = {
      position: {
        findUnique: jest.fn().mockResolvedValue({ id: 'position-1' }),
        delete: jest.fn().mockResolvedValue(undefined),
      },
    };

    const useCase = new DeletePositionUseCase(prisma as never);

    await expect(useCase.execute('position-1')).resolves.toEqual({
      success: true,
    });
    expect(prisma.position.delete).toHaveBeenCalledWith({
      where: { id: 'position-1' },
    });
  });
});
