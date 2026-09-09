import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchDefectCodeDto {
  @ApiPropertyOptional({
    description: 'Search term for code or description in French/English',
    example: '001',
  })
  @IsOptional()
  @IsString()
  q?: string;
}
