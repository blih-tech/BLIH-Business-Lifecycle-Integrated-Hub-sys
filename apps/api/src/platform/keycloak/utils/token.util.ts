import { UnauthorizedException } from '@nestjs/common';

export const extractBearerToken = (authorizationHeader?: string): string => {
  if (!authorizationHeader) {
    throw new UnauthorizedException('Missing Authorization header');
  }

  const match = authorizationHeader.trim().match(/^bearer\s+([\s\S]+)$/i);
  if (!match) {
    throw new UnauthorizedException('Invalid Authorization header format');
  }

  const tokenValue = match[1]
    .trim()
    .replace(/^['"]+/, '')
    .replace(/['"]+$/, '');

  // Node may concatenate duplicate Authorization headers as:
  // "Bearer <token1>, Bearer <token2>". Keep the first bearer value only.
  const firstBearerValue = tokenValue.split(/,\s*bearer\s+/i)[0];
  // Be tolerant to folded/newline whitespace inside header values.
  const token = firstBearerValue.replace(/\s+/g, '');

  if (!token) {
    throw new UnauthorizedException('Invalid Authorization header format');
  }

  return token.replace(/^['"]+|['"]+$/g, '');
};
