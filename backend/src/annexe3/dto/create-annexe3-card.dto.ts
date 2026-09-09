import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CorrectiveActionDto } from './corrective-action.dto';
import { RiskActionDto } from './risk-action.dto';

export class CreateAnnexe3CardDto {
  // PROCESS & HEADER
  @ApiProperty({ example: 'Coupe', enum: ['Coupe', 'WPA', 'WEK'] })
  @IsString()
  @IsNotEmpty()
  productionProcess!: string;

  @ApiProperty({ example: '2026-08-14' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: 'Segment 02' })
  @IsString()
  @IsNotEmpty()
  segmentLine!: string;

  @ApiProperty({ example: 'Sousse 1 (LT4)', required: false })
  @IsString()
  @IsOptional()
  siteName?: string;

  @ApiProperty({ example: 'BMW U11', required: false })
  @IsString()
  @IsOptional()
  clientOemName?: string;

  @ApiProperty({ example: 'Mohamed Trabelsi' })
  @IsString()
  @IsNotEmpty()
  responsiblePerson!: string;

  // ZONES AFFECTED BY THE N.C.
  @ApiProperty({ example: ['Manufacturing'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  zonesAffected?: string[];

  @ApiProperty({ example: 'Line A, Line B', required: false })
  @IsString()
  @IsOptional()
  manufacturingLinesConcerned?: string;

  // ORIGIN OF THE N.C.
  @ApiProperty({ example: ['Notice of the N.C.'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  originOfNC?: string[];

  @ApiProperty({ example: 'RED-9912', required: false })
  @IsString()
  @IsOptional()
  redHoldLabelNo?: string;

  @ApiProperty({ example: 'Other origin details', required: false })
  @IsString()
  @IsOptional()
  originOther?: string;

  // SUBJECT OF THE N.C.
  @ApiProperty({ example: ['Harness'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  subjectOfNC?: string[];

  @ApiProperty({ example: 'Critical', required: false })
  @IsString()
  @IsOptional()
  severity?: string;

  @ApiProperty({ example: '2026-08-10', required: false })
  @IsDateString()
  @IsOptional()
  manufacturingDate?: string;

  // DEFECT & ITEM DETAILS
  @ApiProperty({ example: 'DEF-8802' })
  @IsString()
  @IsNotEmpty()
  defectCode!: string;

  @ApiProperty({ example: 'Insulation damage on connector terminal' })
  @IsString()
  @IsNotEmpty()
  defectDescription!: string;

  @ApiProperty({ example: 'BMW G30', required: false })
  @IsString()
  @IsOptional()
  vehicle?: string;

  @ApiProperty({ example: 'Main Harness', required: false })
  @IsString()
  @IsOptional()
  family?: string;

  @ApiProperty({ example: 'REF-9921-A', required: false })
  @IsString()
  @IsOptional()
  refIndex?: string;

  @ApiProperty({ example: 'ITM-0041', required: false })
  @IsString()
  @IsOptional()
  itemCode?: string;

  // QUANTITIES
  @ApiProperty({ example: 300 })
  @IsInt()
  @Min(1)
  quantityToBeControlled!: number;

  @ApiProperty({ example: 300 })
  @IsInt()
  @Min(0)
  controlledQuantity!: number;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(0)
  defectiveQuantity!: number;

  // DESCRIPTION & PHOTO
  @ApiProperty({
    example: 'Detailed description of the issue...',
    required: false,
  })
  @IsString()
  @IsOptional()
  ncDescription?: string;

  @ApiProperty({
    example: 'https://storage.leoni.com/defects/photo1.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  defectPhotoUrl?: string;

  // RISK TOGGLE & SUB-ARRAYS
  @ApiProperty({ example: false, default: false })
  @IsBoolean()
  riskForReworkOrRepair!: boolean;

  @ApiProperty({ type: [RiskActionDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RiskActionDto)
  riskActions?: RiskActionDto[];

  @ApiProperty({ type: [CorrectiveActionDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CorrectiveActionDto)
  correctiveActions?: CorrectiveActionDto[];

  // COMMENTS & TRACEABILITY
  @ApiProperty({
    example: 'Additional operational comments...',
    required: false,
  })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiProperty({ example: 'Batch #40921, Lot #12', required: false })
  @IsString()
  @IsOptional()
  traceability?: string;

  // APPROVAL WORKFLOW SELECTION
  @ApiProperty({ example: 'PROD-LEADER-01', required: false })
  @IsString()
  @IsOptional()
  assignedProductionLeaderMatricule?: string;

  @ApiProperty({ example: 'QM-REVIEWER-01', required: false })
  @IsString()
  @IsOptional()
  assignedQualityReviewerMatricule?: string;
}
