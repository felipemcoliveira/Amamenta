import * as cookieParser from 'cookie-parser';

import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { EnvironmentConfig } from './app/app.config';

import { SerializerInterceptor } from './serializer';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const validationPipe = new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true
    }
  });

  const serializerInterceptor = new SerializerInterceptor(app.get(Reflector), {
    strategy: 'excludeAll',
    includePermissionGroups: true
  });

  app.setGlobalPrefix('/api');
  app.useStaticAssets('./static', { prefix: '/static' });
  app.useStaticAssets('./client/admin/static', { prefix: '/admin/static' });
  app.useStaticAssets('./client/blog/static', { prefix: '/blog/static' });

  app.use(cookieParser());
  app.useGlobalPipes(validationPipe);
  app.useGlobalInterceptors(serializerInterceptor);

  const configService = app.get(ConfigService);
  const { httpPort } = configService.get<EnvironmentConfig>('env');

  await app.init();
  await app.listen(httpPort);
}

bootstrap();
