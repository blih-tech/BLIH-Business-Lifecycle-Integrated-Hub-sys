import { describe, it, expect } from '@jest/globals';
import { inferFrontendOrigin, isOriginAllowed } from './oidc.util';

describe('Origin Inference', () => {
  describe('inferFrontendOrigin', () => {
    it('should infer origin from referer header', () => {
      const request = {
        headers: {
          referer: 'https://example.com/dashboard',
        },
      } as any;

      const allowedOrigins = ['https://example.com'];
      const result = inferFrontendOrigin(request, allowedOrigins);

      expect(result).toBe('https://example.com');
    });

    it('should infer origin from forwarded headers', () => {
      const request = {
        headers: {
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'app.example.com',
        },
      } as any;

      const allowedOrigins = ['https://app.example.com'];
      const result = inferFrontendOrigin(request, allowedOrigins);

      expect(result).toBe('https://app.example.com');
    });

    it('should infer origin from origin header', () => {
      const request = {
        headers: {
          origin: 'https://localhost:3000',
        },
      } as any;

      const allowedOrigins = [
        'https://localhost:3000',
        'http://localhost:3000',
      ];
      const result = inferFrontendOrigin(request, allowedOrigins);

      expect(result).toBe('https://localhost:3000');
    });

    it('should fallback to host header', () => {
      const request = {
        headers: {
          host: 'localhost:3000',
        },
      } as any;

      const allowedOrigins = ['http://localhost:3000'];
      const result = inferFrontendOrigin(request, allowedOrigins);

      expect(result).toBe('http://localhost:3000');
    });

    it('should fallback to default URL when no valid origin found', () => {
      const request = {
        headers: {},
      } as any;

      const allowedOrigins = ['https://example.com'];
      const result = inferFrontendOrigin(request, allowedOrigins);

      expect(result).toBe('http://localhost:3000');
    });

    it('should handle priority correctly - referer over forwarded', () => {
      const request = {
        headers: {
          referer: 'https://priority.com/page',
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'lower-priority.com',
          origin: 'https://even-lower.com',
        },
      } as any;

      const allowedOrigins = [
        'https://priority.com',
        'https://lower-priority.com',
        'https://even-lower.com',
      ];
      const result = inferFrontendOrigin(request, allowedOrigins);

      expect(result).toBe('https://priority.com');
    });
  });

  describe('isOriginAllowed', () => {
    it('should allow wildcard origins', () => {
      expect(isOriginAllowed('https://any.com', ['*'])).toBe(true);
    });

    it('should allow exact matches', () => {
      expect(
        isOriginAllowed('https://example.com', ['https://example.com']),
      ).toBe(true);
    });

    it('should allow subdomain matches', () => {
      expect(
        isOriginAllowed('https://app.example.com', ['https://example.com']),
      ).toBe(true);
      expect(
        isOriginAllowed('https://api.app.example.com', ['https://example.com']),
      ).toBe(true);
    });

    it('should allow prefix matches for development', () => {
      expect(
        isOriginAllowed('http://localhost:3000/dashboard', [
          'http://localhost:3000',
        ]),
      ).toBe(true);
    });

    it('should reject disallowed origins', () => {
      expect(
        isOriginAllowed('https://malicious.com', ['https://example.com']),
      ).toBe(false);
    });

    it('should reject invalid subdomain matches', () => {
      expect(
        isOriginAllowed('https://evil-example.com', ['https://example.com']),
      ).toBe(false);
    });
  });
});
