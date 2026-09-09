import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CritereTriageDto {
  @ApiProperty({ example: 'Contrôle visuel câblage' })
  @IsString()
  @IsNotEmpty()
  critere!: string;

  @ApiProperty({ example: 'Caisse A-02' })
  @IsString()
  @IsNotEmpty()
  reperageCablagesCaisse!: string;

  @ApiProperty({ example: 'PRD-101' })
  @IsString()
  @IsNotEmpty()
  matriculeExecuteur!: string;

  @ApiProperty({ example: '10 mins' })
  @IsString()
  @IsNotEmpty()
  tempsPrevu!: string;
}

export class InstructionRetoucheDto {
  @ApiProperty({ example: 'Démonter la douille du connecteur X1' })
  @IsString()
  @IsNotEmpty()
  descriptionEtape!: string;

  @ApiProperty({ example: 'Operateur Retouche' })
  @IsString()
  @IsNotEmpty()
  responsable!: string;

  @ApiProperty({ example: '2026-08-11' })
  @IsString()
  @IsNotEmpty()
  delai!: string;

  @ApiProperty({ example: '15 mins' })
  @IsString()
  @IsNotEmpty()
  tempsPrevu!: string;
}

export class PointControleDto {
  @ApiProperty({ example: 'Contrôle visuel du sertissage' })
  @IsString()
  @IsNotEmpty()
  descriptionControle!: string;

  @ApiProperty({ example: 'Agent Qualité' })
  @IsString()
  @IsNotEmpty()
  responsable!: string;

  @ApiProperty({ example: '2026-08-11' })
  @IsString()
  @IsNotEmpty()
  delai!: string;

  @ApiProperty({ example: '5 mins' })
  @IsString()
  @IsNotEmpty()
  tempsPrevu!: string;
}

export class AnalyseRisqueDto {
  @ApiProperty({ example: 'Endommagement du brin lors du dégainage' })
  @IsString()
  @IsNotEmpty()
  risquePotentiel!: string;

  @ApiProperty({ example: 'Utiliser l’outil calibré REF-402' })
  @IsString()
  @IsNotEmpty()
  actionPreventive!: string;

  @ApiProperty({ example: 'PE Specialist' })
  @IsString()
  @IsNotEmpty()
  responsable!: string;

  @ApiProperty({ example: '2026-08-10' })
  @IsString()
  @IsNotEmpty()
  delai!: string;
}
