import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModuleType } from '../enums/module.enum';

export class BrainChatDto {
  @ApiProperty({
    description: 'ID of the user making the request',
    example: 'user-123',
    required: true,
  })
  userId: string;

  @ApiProperty({
    description: 'User question or query',
    example: 'What is our company policy on remote work?',
    required: true,
  })
  question: string;

  @ApiProperty({
    description: 'Module to query',
    enum: ModuleType, // Changed from array to enum reference
    example: ModuleType.HR, // Changed to enum value
    required: true,
  })
  module: ModuleType; // Changed from string to ModuleType type

  @ApiPropertyOptional({
    description: 'Existing session ID for continuing conversation',
    example: 'session-123',
  })
  sessionId?: string;
}

export class ChatResponseDto {
  @ApiProperty({
    description: 'Chat session ID',
    example: 'sess_123456789',
  })
  sessionId: string;

  @ApiProperty({
    description: 'AI generated response',
    example:
      'According to our company policy, remote work is allowed up to 3 days per week...',
  })
  answer: string;

  @ApiProperty({
    description: 'Sources used to generate the response',
    type: [Object],
    example: [{ title: 'HR Policy Document', relevance: 0.95 }],
  })
  sources: any[];
}
