import { PartialType } from '@nestjs/swagger';
import { CreateTriagePlanDto } from './create-triage-plan.dto';

export class UpdateTriagePlanAdminDto extends PartialType(
  CreateTriagePlanDto,
) {}
