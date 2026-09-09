import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOEMDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUUID()
  @IsNotEmpty()
  siteId!: string; // ID of the parent site

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
