import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.setGlobalPrefix('api');
  
  // Configuración de CORS robusta para producción
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3001',
      'http://localhost:3001',
      'https://quantum-flux-solutions-mvp-api.vercel.app' // Tu URL de Vercel explícita
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend is running on port: ${port}`);
}
bootstrap();
