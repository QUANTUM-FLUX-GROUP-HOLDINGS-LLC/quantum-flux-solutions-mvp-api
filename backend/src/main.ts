import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true }); // <-- rawBody: true
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });
  await app.listen(3000);
  console.log(`Backend is running on: http://localhost:3000/api`);
}
bootstrap();
