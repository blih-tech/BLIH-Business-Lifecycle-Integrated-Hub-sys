import {
  BadRequestException,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class ValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const fieldErrors = errors.map((e) => ({
          field: e.property,
          message:
            e.constraints && Object.keys(e.constraints).length > 0
              ? Object.values(e.constraints)[0]
              : 'Invalid value',
        }));
        return new BadRequestException({
          message: 'Validation failed',
          details: 'One or more fields are invalid',
          fieldErrors,
        });
      },
    });
  }
}
