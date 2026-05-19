import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  // Ensure uploads folder exists
  if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // Serve static uploads
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  // Allow larger payload sizes for image base64 or multipart uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
