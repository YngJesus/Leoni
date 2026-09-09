import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Leoni API')
    .setDescription(
      'Leoni backend API for the web app, database access, and future modules.',
    )
    .setVersion('1.0.0')
    .setContact('Leoni Team', 'http://localhost:5173', 'support@leoni.dev')
    .addServer('http://localhost:3000', 'Local API') // <--- Changed from /api to root
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');

  console.log(`Frontend: http://localhost:5173`);
  console.log(`Swagger: http://localhost:${port}/docs`);
  console.log(`PostgreSQL: localhost:5433 / database leoni (pgAdmin desktop)`);
}
bootstrap();
