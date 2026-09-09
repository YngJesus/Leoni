import { PartialType } from '@nestjs/swagger';
import { CreateReparationCardDto } from './create-reparation-card.dto';

export class UpdateReparationCardDto extends PartialType(
  CreateReparationCardDto,
) {}
