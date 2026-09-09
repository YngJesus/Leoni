import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AnalyseRisqueDto, PointControleDto } from './triage-sub-dtos.dto';

export class UpdateStep4QmDto {
  @ApiProperty({ type: [PointControleDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PointControleDto)
  pointsControle?: PointControleDto[];

  // Toggle for "Y A-T-IL UN OU DES RISQUES POTENTIELS LORS DE L'OPÉRATION ?"
  @ApiProperty({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  hasPotentialRisks?: boolean;

  @ApiProperty({ type: [AnalyseRisqueDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AnalyseRisqueDto)
  analysesRisques?: AnalyseRisqueDto[];

  @ApiProperty({ example: 'VALIDATED_OK' })
  @IsString()
  @IsNotEmpty()
  qmMatriculeValidation!: string;
}
