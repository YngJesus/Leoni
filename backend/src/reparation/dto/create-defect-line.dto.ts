import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateDefectLineDto {
  @IsString()
  @IsOptional()
  etiquetteStop?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateProduction?: Date;

  @IsString()
  @IsNotEmpty()
  serieVariante!: string;

  @IsString()
  @IsNotEmpty()
  kskIdUnique!: string;

  @IsString()
  @IsNotEmpty()
  groupeEquipe!: string;

  @IsString()
  @IsNotEmpty()
  numFilDouilleConn!: string;

  @IsString()
  @IsNotEmpty()
  codeDefaut!: string;

  @IsInt()
  @Min(1)
  qte!: number;

  @IsString()
  @IsNotEmpty()
  defautDetecteA!: string;

  @IsString()
  @IsOptional()
  tempsMin?: string;

  @IsString()
  @IsNotEmpty()
  descriptionFaute!: string;

  @IsDate()
  @Type(() => Date)
  dateHeureEntree!: Date;

  @IsString()
  @IsNotEmpty()
  sortiPar!: string;
}
