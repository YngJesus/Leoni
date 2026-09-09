import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefectCode } from './entities/defect-code.entity';
import { DefectCodesController } from './defect-codes.controller';
import { DefectCodesService } from './defect-codes.service';

@Module({
  imports: [TypeOrmModule.forFeature([DefectCode])],
  controllers: [DefectCodesController],
  providers: [DefectCodesService],
  exports: [DefectCodesService, TypeOrmModule],
})
export class DefectCodesModule {}
