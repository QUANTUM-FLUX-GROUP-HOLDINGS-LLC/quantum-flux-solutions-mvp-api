import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  
  // Configuración de CORS dinámica
  const allowedOrigins = [
    'http://localhost:3001',
    'http://staff.local:3001',
    process.env.FRONTEND_URL
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (como Postman o apps móviles)
      if (!origin) return callback(null, true);
      
      // Si el origen está en la lista, o si estamos en desarrollo local
      if (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('local')) {
        return callback(null, true);
      }
      
      // En producción, si no está en la lista, lo bloqueamos
      return callback(new Error('Not allowed by CORS'));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Hacer pública la carpeta uploads para descargas locales
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
