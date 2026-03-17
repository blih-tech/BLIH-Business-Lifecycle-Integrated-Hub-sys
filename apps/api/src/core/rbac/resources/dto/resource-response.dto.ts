import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ResourceResponseDto as ResourceResponseDtoType } from '@repo/types';

export class ResourceResponseDto implements ResourceResponseDtoType {
  @ApiProperty({ example: '8b76752b-df18-45bc-af74-1ea9a0db2e40' })
  id!: string;

  @ApiProperty({ example: 'system_resource' })
  name!: string;

  @ApiPropertyOptional({
    example: 'Resource catalog administration.',
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({ example: '2026-02-20T16:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-02-20T16:00:00.000Z' })
  updatedAt!: Date;
}
