import { Module } from '@nestjs/common';
import {
  SwaggerDocsController,
  SwaggerDownloadController,
  SwaggerSpecRedirectController,
} from './swagger-docs.controller';

@Module({
  controllers: [
    SwaggerDocsController,
    SwaggerDownloadController,
    SwaggerSpecRedirectController,
  ],
})
export class OpenApiDocsModule {}
