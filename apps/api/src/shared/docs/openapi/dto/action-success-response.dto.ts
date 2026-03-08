import { ApiProperty } from '@nestjs/swagger';

export class ActionSuccessResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;
}
