import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CorrectiveActionDto {
  @ApiProperty({
    example: 'Sorting',
    description:
      'Action type (e.g. Accepted state, Sorting, Rework / Repair, Scrap)',
  })
  @IsString()
  @IsNotEmpty()
  actionType!: string;

  @ApiProperty({ example: 'Operator B', required: false })
  @IsString()
  @IsOptional()
  ownerPilot?: string;

  @ApiProperty({ example: '2026-08-14', required: false })
  @IsDateString()
  @IsOptional()
  completionDate?: string;

  @ApiProperty({ example: 300, default: 0 })
  @IsInt()
  @Min(0)
  quantity!: number;

  @ApiProperty({
    example: 45,
    default: 0,
    description: 'Elapsed time in minutes',
  })
  @IsInt()
  @Min(0)
  elapsedTimeMin!: number;
}
