import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateOEMDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsUUID()
  @IsOptional()
  siteId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
