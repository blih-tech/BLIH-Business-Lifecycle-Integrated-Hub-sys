import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeCvDto {
  @ApiProperty({
    description: 'ID of the applicant whose CV to analyze',
    example: 'app_123456789',
    required: true,
  })
  applicantId: string;

  @ApiProperty({
    description: 'ID of the job to analyze against',
    example: 'job_987654321',
    required: true,
  })
  jobId: string;

  @ApiProperty({
    description: 'Keycloak ID of the user making the request',
    example: 'keycloak-user-123',
    required: true,
  })
  keycloakId: string;
}

export class CvAnalysisResponseDto {
  @ApiProperty({
    description: 'Match score between CV and job (0-100)',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  score: number;

  @ApiProperty({
    description: 'Recommendation based on analysis',
    enum: ['STRONG_RECOMMEND', 'RECOMMEND', 'CONSIDER', 'REJECT'],
    example: 'RECOMMEND',
  })
  recommendation: string;

  @ApiProperty({
    description: 'Key strengths identified in the CV',
    type: [String],
    example: ['Strong technical skills', 'Relevant experience'],
  })
  strengths: string[];

  @ApiProperty({
    description: 'Areas for improvement',
    type: [String],
    example: ['Limited leadership experience', 'Gap in employment'],
  })
  weaknesses: string[];

  @ApiProperty({
    description: 'AI-generated summary of the analysis',
    example: 'Candidate shows strong alignment with technical requirements...',
  })
  summary: string;

  @ApiProperty({
    description: 'Confidence score of the analysis (0-1)',
    example: 0.92,
    minimum: 0,
    maximum: 1,
  })
  confidence: number;

  @ApiProperty({
    description: 'Version of the model used',
    example: 'v2.1.0',
  })
  modelVersion: string;
}
