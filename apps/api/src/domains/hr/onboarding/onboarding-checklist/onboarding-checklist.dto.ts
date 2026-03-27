import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ONBOARDING_CHECKLIST_STATUSES } from '../onboarding.dto';
import type { OnboardingChecklistStatusValue } from '../onboarding.dto';

const normalizeEnumValue = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  return value
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
};

export class UpdateChecklistStatusDto {
  @ApiProperty({
    enum: ONBOARDING_CHECKLIST_STATUSES,
    description: 'The new status of the checklist item.',
    example: 'IN_PROGRESS',
  })
  @Transform(normalizeEnumValue)
  @IsEnum(ONBOARDING_CHECKLIST_STATUSES)
  status!: OnboardingChecklistStatusValue;

  @ApiPropertyOptional({
    description: 'Updated due date for this checklist item.',
    example: '2026-03-16T10:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
