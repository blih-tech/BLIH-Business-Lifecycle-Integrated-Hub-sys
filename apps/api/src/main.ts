import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { buildCorsOptions } from './config/cors.util';
import { setupSwagger } from './shared/docs/openapi';
import { ValidationPipe } from './shared/pipes/validation.pipe';

// Disable Node.js HTTP debugging and axios verbose logging
process.env.NODE_DEBUG = '';
process.env.DEBUG = '';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const swaggerEnabled =
    configService.get<string>('SWAGGER_ENABLED', 'true') !== 'false';
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const port = Number(configService.get<string>('PORT', '5000'));
  const apiHost = configService.get<string>('API_HOST', 'localhost');
  const helmetEnabled =
    configService.get<string>('HELMET_ENABLED', 'true') !== 'false';

  if (helmetEnabled) {
    app.use(
      helmet({
        crossOriginOpenerPolicy: false,
        originAgentCluster: false,
        contentSecurityPolicy: false,
      }),
    );
  }
  app.enableCors(buildCorsOptions(corsOrigin, nodeEnv));
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
