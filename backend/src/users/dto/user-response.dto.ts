import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';

export class UserResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() matricule!: string;
  @ApiProperty() nomComplet!: string;
  @ApiProperty({ enum: UserRole }) role!: UserRole;
  @ApiProperty() createdAt!: Date;
}
