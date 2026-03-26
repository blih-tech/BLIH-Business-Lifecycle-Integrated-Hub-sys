import { ApiProperty } from '@nestjs/swagger';

export class ScreenCandidatesDto {
  @ApiProperty({
    description: 'ID of the job to screen candidates for',
    example: 'job_987654321',
    required: true,
  })
  jobId: string;
}

export class RankedCandidateDto {
  @ApiProperty({
    description: 'Candidate ID',
    example: 'app_123456789',
  })
  candidateId: string;

  @ApiProperty({
    description: 'Match score (0-100)',
    example: 85,
  })
  score: number;

  @ApiProperty({
    description: 'Recommendation',
    enum: ['STRONG_RECOMMEND', 'RECOMMEND', 'CONSIDER', 'REJECT'],
    example: 'RECOMMEND',
  })
  recommendation: string;
}

export class ScreenCandidatesResponseDto {
  @ApiProperty({
    description: 'Total number of applicants screened',
    example: 25,
  })
  totalApplicants: number;

  @ApiProperty({
    description: 'Ranked list of candidates by match score',
    type: [RankedCandidateDto],
  })
  rankedApplicants: RankedCandidateDto[];
}
