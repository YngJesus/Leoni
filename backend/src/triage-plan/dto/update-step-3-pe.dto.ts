import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { InstructionRetoucheDto } from './triage-sub-dtos.dto';

export class UpdateStep3PeDto {
  @ApiProperty({ type: [InstructionRetoucheDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstructionRetoucheDto)
  instructionsRetouche!: InstructionRetoucheDto[];
}
