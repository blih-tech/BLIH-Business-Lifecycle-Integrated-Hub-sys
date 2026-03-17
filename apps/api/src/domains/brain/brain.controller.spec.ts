import { Test, TestingModule } from '@nestjs/testing';
import { BrainController } from './brain.controller';
import { BrainService } from './brain.service';

describe('BrainController', () => {
  let controller: BrainController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrainController],
      providers: [{ provide: BrainService, useValue: {} }],
    }).compile();

    controller = module.get<BrainController>(BrainController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
