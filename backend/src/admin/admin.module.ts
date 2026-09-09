import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ClientOEM } from './entities/client-oem.entity';
import { Site } from './entities/site.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Site, ClientOEM])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
