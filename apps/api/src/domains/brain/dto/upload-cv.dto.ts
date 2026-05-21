import { ApiProperty } from '@nestjs/swagger';

export class UploadCvDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'CV file to upload (PDF, DOC, DOCX, TXT)',
    required: true,
  })
  file: any;

  @ApiProperty({
    description: 'ID of the applicant',
    example: 'app_123456789',
    required: true,
  })
  applicantId!: string;

  @ApiProperty({
    description: 'ID of the job',
    example: 'job_987654321',
    required: true,
  })
  jobId!: string;
}

export class UploadCvResponseDto {
  @ApiProperty({
    description: 'ID of the applicant',
    example: 'app_123456789',
  })
  applicantId!: string;

  @ApiProperty({
    description: 'Match score if auto-screening was performed',
    example: 85,
    required: false,
  })
  score?: number;

  @ApiProperty({
    description: 'Recommendation if auto-screening was performed',
    enum: ['STRONG_RECOMMEND', 'RECOMMEND', 'CONSIDER', 'REJECT'],
    required: false,
  })
  recommendation?: string;

  @ApiProperty({
    description: 'Status of the upload operation',
    example: 'Success: CV Uploaded and AI Screened',
  })
  status!: string;

  @ApiProperty({
    description: 'Extracted text from CV (only if AI screening failed)',
    required: false,
  })
  cvText?: string;
}
