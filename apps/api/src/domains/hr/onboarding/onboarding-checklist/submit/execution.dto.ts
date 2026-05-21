import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SubmitUserProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: ['MALE', 'FEMALE', 'OTHER'] })
  @IsOptional()
  @IsString() // Simplification for schema compat
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  maritalStatus?: string;
}

export class SubmitAddressTaskDto {
  @ApiProperty()
  @IsUUID()
  countryId!: string;

  @ApiProperty()
  @IsString()
  city!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  houseNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postalCode?: string;
}

export class SubmitBankDetailTaskDto {
  @ApiProperty()
  @IsString()
  bankName!: string;

  @ApiProperty()
  @IsString()
  branch!: string;

  @ApiProperty()
  @IsString()
  accountType!: string;

  @ApiProperty()
  @IsString()
  accountNumber!: string;
}

export class SubmitEmergencyContactTaskDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  relationship!: string;

  @ApiProperty()
  @IsString()
  phone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;
}

export class SubmitEducationTaskDto {
  @ApiProperty()
  @IsString()
  institution!: string;

  @ApiProperty()
  @IsString()
  degree!: string;

  @ApiProperty()
  @IsString()
  fieldOfStudy!: string;

  @ApiProperty()
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class SubmitContractTaskDto {
  @ApiProperty({
    description:
      'The Contract ID linking to the generated contract template instance',
  })
  @IsUUID()
  contractId!: string;

  @ApiPropertyOptional({
    description: 'URL of the signed file explicitly uploaded by candidate',
  })
  @IsOptional()
  @IsString()
  signedFileUrl?: string;
}

export class SubmitPolicyItemDto {
  @ApiProperty()
  @IsUUID()
  policyId!: string;

  @ApiProperty()
  @IsUUID()
  policyVersionId!: string;
}

export class SubmitPolicyTaskDto {
  @ApiProperty({ type: [SubmitPolicyItemDto] })
  @ValidateNested({ each: true })
  @Type(() => SubmitPolicyItemDto)
  acknowledgements!: SubmitPolicyItemDto[];
}

export class SubmitDocumentTaskDto {
  @ApiProperty({
    enum: [
      'CONTRACT',
      'ID',
      'CERTIFICATE',
      'MEDICAL',
      'RESUME',
      'QUALIFICATION',
      'OTHER',
    ],
  })
  @IsString()
  type!: string;

  @ApiProperty()
  @IsString()
  fileUrl!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
