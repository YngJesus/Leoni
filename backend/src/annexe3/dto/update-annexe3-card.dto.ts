import { PartialType } from '@nestjs/swagger';
import { CreateAnnexe3CardDto } from './create-annexe3-card.dto';

export class UpdateAnnexe3CardDto extends PartialType(CreateAnnexe3CardDto) {}
