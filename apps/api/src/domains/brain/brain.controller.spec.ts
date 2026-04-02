import { Test, TestingModule } from '@nestjs/testing';
import { BrainController } from './brain.controller';
import { BrainService } from './brain.service';
import { KeycloakAuthGuard } from '../../shared/guards/keycloak-auth.guard';

describe('BrainController', () => {
  let controller: BrainController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrainController],
      providers: [
        {
          provide: BrainService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(KeycloakAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<BrainController>(BrainController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
