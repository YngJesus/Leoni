import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CritereTriageDto } from './triage-sub-dtos.dto';

export class CreateTriagePlanDto {
  // Step 1: Données Générales
  @ApiProperty({ example: '2026-08-10T09:50:46.851Z' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: 'OF-88402' })
  @IsString()
  @IsNotEmpty()
  numOrdre!: string;

  @ApiProperty({ example: 'SN-904123' })
  @IsString()
  @IsNotEmpty()
  numSerie!: string;

  @ApiProperty({ example: 50 })
  @IsInt()
  quantiteBloquee!: number;

  @ApiProperty({ example: 'FR-2026-001' })
  @IsString()
  @IsNotEmpty()
  numFicheRetouche!: string;

  @ApiProperty({ example: 'Défaut d isolation connecteur' })
  @IsString()
  @IsNotEmpty()
  motifBlocage!: string;

  // Step 2: Responsables & Approuveurs
  @ApiProperty({ example: 'PE-9021', required: false })
  @IsString()
  @IsOptional()
  assignedPeMatricule?: string;

  @ApiProperty({ example: 'QM-1042' })
  @IsString()
  @IsNotEmpty()
  assignedQmMatricule!: string;

  // Step 2: Critères & Résultats
  @ApiProperty({ type: [CritereTriageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CritereTriageDto)
  criteresTriage!: CritereTriageDto[];

  @ApiProperty({ example: 45 })
  @IsInt()
  quantiteConforme!: number;

  @ApiProperty({ example: 5 })
  @IsInt()
  quantiteNonConforme!: number;

  @ApiProperty({ example: '45 mins', required: false })
  @IsString()
  @IsOptional()
  tempsReelTriage?: string;

  @ApiProperty({ example: 'Sousse 1 (LT4)', required: false })
  @IsString()
  @IsOptional()
  siteName?: string;

  @ApiProperty({ example: 'BMW U11', required: false })
  @IsString()
  @IsOptional()
  clientOemName?: string;

  // Step 2: Décision Suite au Triage (Moved here from Step 3!)
  @ApiProperty({
    example: 'Réparer et / ou Retoucher',
    enum: ['Réparer et / ou Retoucher', 'REBUTER (SCRAP)'],
  })
  @IsString()
  @IsNotEmpty()
  decision!: string;

  @ApiProperty({ example: 'Justification technique ou économique du choix...' })
  @IsString()
  @IsNotEmpty()
  justificationDecision!: string;
}
