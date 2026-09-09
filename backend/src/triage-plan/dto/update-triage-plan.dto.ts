import { PartialType } from '@nestjs/swagger';
import { CreateTriagePlanDto } from './create-triage-plan.dto';

export class UpdateTriagePlanDto extends PartialType(CreateTriagePlanDto) {}
