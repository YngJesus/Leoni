import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientOEM } from '../admin/entities/client-oem.entity';
import { Site } from '../admin/entities/site.entity';
import { DefectLine } from './entities/defect-line.entity';
import { ReparationCard } from './entities/reparation-card.entity';
import { ReparationController } from './reparation.controller';
import { ReparationService } from './reparation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReparationCard, DefectLine, Site, ClientOEM]),
  ],
  controllers: [ReparationController],
  providers: [ReparationService],
})
export class ReparationModule {}
