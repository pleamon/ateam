import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTaskDto {
  @ApiProperty({ description: 'Agent ID' })
  @IsUUID()
  agentId: string;
}
