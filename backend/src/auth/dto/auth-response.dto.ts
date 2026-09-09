import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/enums/user-role.enum';

export class UserPayloadDto {
  @ApiProperty() id!: string;
  @ApiProperty() matricule!: string;
  @ApiProperty() nomComplet!: string;
  @ApiProperty({ enum: UserRole }) role!: UserRole;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token!: string;

  @ApiProperty({ type: UserPayloadDto })
  user!: UserPayloadDto;
}
