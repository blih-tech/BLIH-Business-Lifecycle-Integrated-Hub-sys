import { UpdateSystemConfigUseCase } from './update-system-config.usecase';

describe('UpdateSystemConfigUseCase', () => {
  it('upserts config', async () => {
    const upsertConfig = jest
      .fn()
      .mockResolvedValue({ key: 'k', value: { x: 1 } });

    const prisma = {
      systemConfig: { upsert: upsertConfig },
    };
    const useCase = new UpdateSystemConfigUseCase(prisma as never);
    await useCase.execute({ key: 'k', value: { x: 1 } });

    expect(upsertConfig).toHaveBeenCalledTimes(1);
  });
});
