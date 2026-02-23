import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { setupSwagger } from './shared/docs/openapi';
import { ValidationPipe } from './shared/pipes/validation.pipe';

// Disable Node.js HTTP debugging and axios verbose logging
process.env.NODE_DEBUG = '';
process.env.DEBUG = '';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const swaggerEnabled =
    configService.get<string>('SWAGGER_ENABLED', 'true') !== 'false';
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');
  const port = Number(configService.get<string>('PORT', '5000'));
  const apiHost = configService.get<string>('API_HOST', 'localhost');

  app.use(helmet());
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin,
    credentials: true,
  });
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['api/docs', 'api/openapi.json', 'api/openapi.yaml'],
  });
  app.useGlobalPipes(new ValidationPipe());

  if (swaggerEnabled) {
    setupSwagger(app);
  }

  await app.listen(port, apiHost);
}
void bootstrap();
