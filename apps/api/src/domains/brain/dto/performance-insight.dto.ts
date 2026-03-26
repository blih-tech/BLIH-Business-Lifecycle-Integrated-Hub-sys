import { ApiProperty } from '@nestjs/swagger';

export class PerformanceInsightsResponseDto {
  @ApiProperty({
    description: 'Employee ID',
    example: 'emp_123456789',
  })
  employeeId: string;

  @ApiProperty({
    description: 'AI-generated insights about employee performance',
    type: [String],
    example: [
      'Consistently exceeds technical targets',
      'Strong collaboration with cross-functional teams',
    ],
  })
  insights: string[];

  @ApiProperty({
    description: 'AI-generated recommendations for development',
    type: [String],
    example: [
      'Consider leadership training program',
      'Opportunity to mentor junior developers',
    ],
  })
  recommendations: string[];

  @ApiProperty({
    description: 'Timestamp of analysis',
    example: '2026-03-26T09:21:00.000Z',
  })
  createdAt: Date;
}
