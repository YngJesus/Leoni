import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualityCheck } from './entities/quality-check.entity';
import { RetouchInstruction } from './entities/retouch-instruction.entity';
import { RiskAnalysis } from './entities/risk-analysis.entity';
import { TriageCriterion } from './entities/triage-criterion.entity';
import { TriagePlan } from './entities/triage-plan.entity';
import { TriagePlanController } from './triage-plan.controller';
import { TriagePlanService } from './triage-plan.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    NotificationsModule,
    TypeOrmModule.forFeature([
      TriagePlan,
      TriageCriterion,
      RetouchInstruction,
      QualityCheck,
      RiskAnalysis,
    ]),
  ],
  controllers: [TriagePlanController],
  providers: [TriagePlanService],
  exports: [TriagePlanService],
})
export class TriagePlanModule {}
