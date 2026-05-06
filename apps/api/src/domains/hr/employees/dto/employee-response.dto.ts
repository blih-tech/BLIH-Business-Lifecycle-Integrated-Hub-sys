import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EmploymentType,
  LifecycleStatus,
} from '../../../../platform/prisma/prisma-client';

export class EmployeeListItemResponseDto {
  @ApiProperty({ example: 'd53219ba-7856-4c17-94bc-c40d6a7d0895' })
  id!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: '0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374',
  })
  userId!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'ae3fdb37-c555-4b17-b320-d5f8b435f667',
  })
  keycloakId!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'jane.doe' })
  username!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'jane.doe@blih.local' })
  email!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Jane' })
  firstName!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Doe' })
  lastName!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '+251911000000' })
  phone!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'ACTIVE' })
  status!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '1f31a301-dfb8-4071-aab1-ad6bc4891da7',
  })
  departmentId!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Engineering' })
  departmentName!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'EMP-00124' })
  employeeCode!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'b6f9c3c0-88f3-4b92-9c44-4e9f5d0d4964',
  })
  positionId!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Senior Backend Engineer' })
  positionTitle!: string | null;

  @ApiProperty({ enum: EmploymentType, example: EmploymentType.FULL_TIME })
  employmentType!: EmploymentType;

  @ApiPropertyOptional({ nullable: true, example: LifecycleStatus.ACTIVE })
  lifecycleStatus!: LifecycleStatus | null;

  @ApiPropertyOptional({ nullable: true, example: '2025-12-01T00:00:00.000Z' })
  hiredAt!: string | null;

  @ApiProperty({ example: '2025-12-01T08:00:00.000Z' })
  createdAt!: string;
}

// Full employee response DTO moved to `dto/employee-full-response.dto.ts`.
