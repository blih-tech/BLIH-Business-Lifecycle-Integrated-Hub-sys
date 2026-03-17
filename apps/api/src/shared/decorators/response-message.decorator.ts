import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiExtension } from '@nestjs/swagger';

export const RESPONSE_MESSAGE_KEY = 'responseMessage';
export const RESPONSE_MESSAGE_EXTENSION = 'x-response-message';

export const ResponseMessage = (message: string) =>
  applyDecorators(
    SetMetadata(RESPONSE_MESSAGE_KEY, message),
    ApiExtension(RESPONSE_MESSAGE_EXTENSION, message),
  );
