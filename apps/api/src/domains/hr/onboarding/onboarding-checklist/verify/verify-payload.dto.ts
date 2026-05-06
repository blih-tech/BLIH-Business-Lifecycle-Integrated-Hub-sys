import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyPayloadDto {
  @ApiProperty({ description: 'HR Approval status resolving PENDING records' })
  @IsBoolean()
  approved!: boolean;

  @ApiPropertyOptional({
    description: 'Provided justification when rejecting records',
  })
  @IsOptional()
  @IsString()
  hrFeedback?: string;
}
