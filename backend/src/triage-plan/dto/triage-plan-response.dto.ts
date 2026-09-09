import { ApiProperty } from '@nestjs/swagger';
import { TriagePlanStatus } from '../enums/triage.enums';

export class DonneesGeneralesDto {
  @ApiProperty() date!: Date;
  @ApiProperty() numOrdre?: string;
  @ApiProperty() numSerie!: string;
  @ApiProperty() quantiteBloquee!: number;
  @ApiProperty() numFicheRetouche!: string;
  @ApiProperty() motifBlocage!: string;
}

export class TriageSectionDto {
  @ApiProperty() productionEngineeringMatricule?: string;
  @ApiProperty() qualiteQmMatricule?: string;
  @ApiProperty({ type: [Object] }) criteresTriage!: any[];
  @ApiProperty() quantiteConforme!: number;
  @ApiProperty() quantiteNonConforme!: number;
  @ApiProperty() tempsReelTriage?: string;
}

export class DecisionPlanRetoucheDto {
  @ApiProperty() decision?: string;
  @ApiProperty() justificationDecision?: string;
  @ApiProperty({ type: [Object] }) instructionsRetouche!: any[];
}

export class ControleValidationDto {
  @ApiProperty({ type: [Object] }) pointsControle!: any[];
  @ApiProperty({ type: [Object] }) analysesRisques!: any[];
  @ApiProperty() qmMatriculeValidation?: string;
  @ApiProperty() validatedAt?: Date;
}

export class TriagePlanGroupedResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: TriagePlanStatus }) status!: TriagePlanStatus;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;

  @ApiProperty({ type: DonneesGeneralesDto })
  donneesGenerales!: DonneesGeneralesDto;

  @ApiProperty({ type: TriageSectionDto })
  triage!: TriageSectionDto;

  @ApiProperty({ type: DecisionPlanRetoucheDto })
  decisionPlanRetouche!: DecisionPlanRetoucheDto;

  @ApiProperty({ type: ControleValidationDto })
  controleValidation!: ControleValidationDto;
}
