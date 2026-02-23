import { Test, TestingModule } from '@nestjs/testing';
import { BrainController } from './brain.controller';

describe('BrainController', () => {
  let controller: BrainController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrainController],
    }).compile();

    controller = module.get<BrainController>(BrainController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
