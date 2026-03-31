import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees/employees.controller';
import { CreateEmployeeUseCase } from './employees/use-cases/create-employee.usecase';
import {
  GetEmployeeFullUseCase,
  ListAllEmployeesUseCase,
  ListPaginatedEmployeesUseCase,
} from './employees/use-cases/list-employees.usecase';
import { KeycloakAuthGuard } from '../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../shared/guards/rbac.guard';
import { UpdateEmployeeUseCase } from './employees/use-cases/update-employee.usecase';

describe('EmployeesController', () => {
  let controller: EmployeesController;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        {
          provide: CreateEmployeeUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateEmployeeUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListAllEmployeesUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListPaginatedEmployeesUseCase,
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
