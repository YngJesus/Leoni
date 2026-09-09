import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReparationModule } from './reparation/reparation.module';
import { TriagePlanModule } from './triage-plan/triage-plan.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { Annexe3Module } from './annexe3/annexe3.module';
import { DefectCodesModule } from './defect-codes/defect-codes.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    // Load .env variables globally
    ConfigModule.forRoot({ isGlobal: true }),

    // Configure TypeORM asynchronously using ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const isLocalUrl =
          !databaseUrl ||
          databaseUrl.includes('localhost') ||
          databaseUrl.includes('127.0.0.1');

        return {
          type: 'postgres' as const,
          ...(databaseUrl
            ? {
                url: databaseUrl,
                ssl: isLocalUrl ? false : { rejectUnauthorized: false },
              }
            : {
                host: configService.get<string>('DB_HOST') || 'localhost',
                port: Number(configService.get('DB_PORT') || 5433),
                username:
                  configService.get<string>('DB_USERNAME') || 'postgres',
                password:
                  configService.get<string>('DB_PASSWORD') || 'postgres',
                database: configService.get<string>('DB_NAME') || 'leoni',
              }),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),

    AdminModule,

    ReparationModule,

    TriagePlanModule,

    UsersModule,

    AuthModule,

    Annexe3Module,

    DefectCodesModule,

    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
