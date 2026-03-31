import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { EmployeePermissions } from '@repo/types/rbac';
import {
  ApiDefaultErrors,
  ApiEnvelopeArrayResponse,
  ApiEnvelopeOkResponse,
  ApiProtected,
} from '../../../../shared/docs/openapi';
import { CreateEmployeeDto } from '../dto/employee-create.dto';
import { EmployeeFullResponseDto } from '../dto/employee-full-response.dto';
import { EmployeeListItemResponseDto } from '../dto/employee-response.dto';
import { EmployeeListQueryDto } from '../dto/employee-list-query.dto';
import { UpdateEmployeeDto } from '../dto/employee-update.dto';

export const ApiEmployeeTag = () => ApiTags('HR Employees');

export const ApiCreateEmployee = () =>
  applyDecorators(
    ApiProtected({
      path: '/api/v1/hr/employees',
      roles: [EmployeePermissions.CREATE],
    }),
    ApiOperation({ summary: 'Create employee (provisions user + HR records)' }),
    ApiEnvelopeOkResponse(EmployeeFullResponseDto, 'Created employee'),
    ApiDefaultErrors({
      path: '/api/v1/hr/employees',
      badRequest: 'Employee payload is invalid',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
      conflict: 'User already exists',
    }),
  );

export const ApiListAllEmployees = () =>
  applyDecorators(
    ApiProtected({
      path: '/api/v1/hr/employees',
      roles: [EmployeePermissions.VIEW],
    }),
    ApiOperation({
      summary: 'List employees (unpaginated) with filters/search',
    }),
    ApiEnvelopeArrayResponse(EmployeeListItemResponseDto, 'Employees'),
    ApiDefaultErrors({
      path: '/api/v1/hr/employees',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );

export const ApiListPaginatedEmployees = () =>
  applyDecorators(
    ApiProtected({
      path: '/api/v1/hr/employees/paginated',
      roles: [EmployeePermissions.VIEW],
    }),
    ApiOperation({ summary: 'List employees (paginated) with filters/search' }),
    ApiEnvelopeOkResponse(EmployeeListItemResponseDto, 'Employees (paginated)'),
    ApiDefaultErrors({
      path: '/api/v1/hr/employees/paginated',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );

export const ApiGetEmployeeById = () =>
  applyDecorators(
    ApiProtected({
      path: '/api/v1/hr/employees/:id',
      roles: [EmployeePermissions.VIEW],
    }),
    ApiOperation({ summary: 'Get employee (full) by id' }),
    ApiParam({
      name: 'id',
      description: 'Employee id, user id, or Keycloak subject',
    }),
    ApiEnvelopeOkResponse(EmployeeFullResponseDto, 'Employee'),
    ApiDefaultErrors({
      path: '/api/v1/hr/employees/:id',
      notFound: 'Employee not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
    }),
  );

export const ApiUpdateEmployee = () =>
  applyDecorators(
    ApiProtected({
      path: '/api/v1/hr/employees/:id',
      roles: [EmployeePermissions.UPDATE],
    }),
    ApiOperation({ summary: 'Update employee (excluding auth email/phone)' }),
    ApiParam({
      name: 'id',
      description: 'Employee id',
    }),
    ApiEnvelopeOkResponse(EmployeeFullResponseDto, 'Updated employee'),
    ApiDefaultErrors({
      path: '/api/v1/hr/employees/:id',
      badRequest: 'Employee update payload is invalid',
      notFound: 'Employee not found',
      unauthorized: 'Unauthorized: missing or invalid bearer access token',
      forbidden: 'Required roles are missing',
      conflict: 'Duplicate employeeCode or constraint violation',
    }),
  );

// Note: the actual DTO types are referenced to keep Swagger accurate when the
// controller uses class-validator DTOs; they are imported above intentionally.
void CreateEmployeeDto;
void UpdateEmployeeDto;
void EmployeeListQueryDto;
