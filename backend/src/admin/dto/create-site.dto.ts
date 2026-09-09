import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSiteDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
