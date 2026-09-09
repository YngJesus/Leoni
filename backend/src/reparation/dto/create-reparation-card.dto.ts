import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ReparationType } from '../enums/reparation.enums';
import { CreateDefectLineDto } from './create-defect-line.dto';

export class CreateReparationCardDto {
  @IsUUID()
  @IsNotEmpty()
  siteId!: string;

  @IsUUID()
  @IsNotEmpty()
  clientOemId!: string;

  @IsDate()
  @Type(() => Date)
  date!: Date;

  @IsEnum(ReparationType)
  typeReparation!: ReparationType;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDefectLineDto)
  defectLines!: CreateDefectLineDto[];
}
