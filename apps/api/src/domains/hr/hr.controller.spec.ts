import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees/employees.controller';
import { ListEmployeesUseCase } from './employees/use-cases/list-employees.usecase';
import { GetEmployeeFullUseCase } from './employees/use-cases/get-employee-full.usecase';
import { KeycloakAuthGuard } from '../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../shared/guards/rbac.guard';

describe('EmployeesController', () => {
  let controller: EmployeesController;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        {
          provide: ListEmployeesUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetEmployeeFullUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    })
      .overrideGuard(KeycloakAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RbacGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) });

    const module: TestingModule = await moduleBuilder.compile();

    controller = module.get<EmployeesController>(EmployeesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
