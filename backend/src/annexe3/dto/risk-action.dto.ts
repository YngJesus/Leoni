import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class RiskActionDto {
  @ApiProperty({ example: 'Perform isolation check on connector terminal' })
  @IsString()
  @IsNotEmpty()
  actionRiskDescription!: string;

  @ApiProperty({ example: 'Tech A' })
  @IsString()
  @IsNotEmpty()
  ownerPilot!: string;

  @ApiProperty({ example: '2026-08-15' })
  @IsDateString()
  completionDate!: string;

  @ApiProperty({ example: 'OK', default: 'OK' })
  @IsString()
  @IsNotEmpty()
  successCheck!: string;

  @ApiProperty({
    example: 'Verified with calibrated multimeter',
    required: false,
  })
  @IsString()
  @IsOptional()
  verificationDetails?: string;
}
