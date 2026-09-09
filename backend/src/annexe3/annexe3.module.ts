import { Module } from '@nestjs/common';
import { Annexe3Service } from './annexe3.service';
import { Annexe3Controller } from './annexe3.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Annexe3Card } from './entities/annexe3-card.entity';
import { Annexe3RiskAction } from './entities/annexe3-risk-action.entity';
import { Annexe3CorrectiveAction } from './entities/annexe3-corrective-action.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    NotificationsModule,
    TypeOrmModule.forFeature([
      Annexe3Card,
      Annexe3CorrectiveAction,
      Annexe3RiskAction,
    ]),
  ],
  controllers: [Annexe3Controller],
  providers: [Annexe3Service],
  exports: [Annexe3Service], // Export the service to make it available for injection in other modules
})
export class Annexe3Module {}
