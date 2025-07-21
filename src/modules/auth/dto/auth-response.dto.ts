import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@generated/prisma';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  nickname?: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
