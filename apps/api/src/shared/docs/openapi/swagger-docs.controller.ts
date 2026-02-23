import { Controller, Get, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Public } from '../../decorators/public.decorator';
import { SWAGGER_EXPORT_BUTTON_SCRIPT } from './swagger-export-button';

function normalizePath(p: string): string {
  return p.replace(/^\/+/, '').replace(/\/+$/, '');
}

/**
 * Serves Swagger helper routes.
 * All routes return JSON payloads so global response envelopes are applied consistently.
 */
@ApiExcludeController()
@Controller()
export class SwaggerDocsController {
  constructor(private readonly config: ConfigService) {}

  @Public()
  @Get('api/docs')
  redirectToDocs(@Res() res: Response): void {
    const prefix = normalizePath(
      this.config.get<string>('API_PREFIX', 'api/v1'),
    );
    const docsPath = normalizePath(
      this.config.get<string>('SWAGGER_PATH', 'api/docs'),
    );
    res.redirect(302, `/${prefix}/${docsPath}`);
  }

  @Public()
  @Get('api/docs/export-button.js')
  getExportButtonScript(): string {
    return SWAGGER_EXPORT_BUTTON_SCRIPT.trim();
  }
}

/**
 * Returns OpenAPI specs as JSON payload for clients that need downloadable content.
 */
@ApiExcludeController()
@Controller('api/docs/download')
export class SwaggerDownloadController {
  constructor(private readonly config: ConfigService) {}

  private getSpecUrl(req: Request, format: 'json' | 'yaml'): string {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const prefix = normalizePath(
      this.config.get<string>('API_PREFIX', 'api/v1'),
    );
    const docsPath = normalizePath(
      this.config.get<string>('SWAGGER_PATH', 'api/docs'),
    );
    const filename = format === 'yaml' ? 'openapi.yaml' : 'openapi.json';
    return `${baseUrl}/${prefix}/${docsPath}/${filename}`;
  }

  @Public()
  @Get('openapi.json')
  async downloadOpenApiJson(@Req() req: Request, @Res() res: Response) {
    const specUrl = this.getSpecUrl(req, 'json');
    const response = await fetch(specUrl, {
      headers: { accept: 'application/json' },
    });
    const text = await response.text();

    if (!response.ok) {
      res.status(response.status).type('text/plain; charset=utf-8').send(text);
      return;
    }

    res
      .status(200)
      .setHeader('Content-Type', 'application/json; charset=utf-8')
      .setHeader('Content-Disposition', 'attachment; filename="openapi.json"')
      .send(text);
  }

  @Public()
  @Get('openapi.yaml')
  async downloadOpenApiYaml(@Req() req: Request, @Res() res: Response) {
    const specUrl = this.getSpecUrl(req, 'yaml');
    const response = await fetch(specUrl, {
      headers: { accept: 'application/yaml, application/x-yaml, text/yaml' },
    });
    const text = await response.text();

    if (!response.ok) {
      res.status(response.status).type('text/plain; charset=utf-8').send(text);
      return;
    }

    res
      .status(200)
      .setHeader('Content-Type', 'application/yaml; charset=utf-8')
      .setHeader('Content-Disposition', 'attachment; filename="openapi.yaml"')
      .send(text);
  }
}

/**
 * Returns corrected spec URLs for clients using wrong non-docs paths.
 */
@ApiExcludeController()
@Controller('api')
export class SwaggerSpecRedirectController {
  constructor(private readonly config: ConfigService) {}

  @Public()
  @Get('openapi.json')
  redirectToDownloadJson(@Res() res: Response): void {
    const prefix = normalizePath(
      this.config.get<string>('API_PREFIX', 'api/v1'),
    );
    const docsPath = normalizePath(
      this.config.get<string>('SWAGGER_PATH', 'api/docs'),
    );
    res.redirect(302, `/${prefix}/${docsPath}/download/openapi.json`);
  }

  @Public()
  @Get('openapi.yaml')
  redirectToDownloadYaml(@Res() res: Response): void {
    const prefix = normalizePath(
      this.config.get<string>('API_PREFIX', 'api/v1'),
    );
    const docsPath = normalizePath(
      this.config.get<string>('SWAGGER_PATH', 'api/docs'),
    );
    res.redirect(302, `/${prefix}/${docsPath}/download/openapi.yaml`);
  }
}
