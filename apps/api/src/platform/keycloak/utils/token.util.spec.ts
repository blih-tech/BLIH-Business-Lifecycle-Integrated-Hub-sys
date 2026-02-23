import { extractBearerToken } from './token.util';

describe('token.util', () => {
  const firstToken = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyLTEifQ.signature1';
  const secondToken = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyLTIifQ.signature2';

  it('extracts token from a valid bearer header', () => {
    expect(extractBearerToken(`Bearer ${firstToken}`)).toBe(firstToken);
  });

  it('extracts token from a quoted bearer token', () => {
    expect(extractBearerToken(`Bearer "${firstToken}"`)).toBe(firstToken);
  });

  it('extracts first token when duplicate Authorization headers are concatenated', () => {
    expect(
      extractBearerToken(`Bearer ${firstToken}, Bearer ${secondToken}`),
    ).toBe(firstToken);
  });

  it('extracts token when header value contains folded whitespace', () => {
    const foldedToken = `${firstToken.slice(0, 20)} \n ${firstToken.slice(20)}`;
    expect(extractBearerToken(`Bearer ${foldedToken}`)).toBe(firstToken);
  });

  it('rejects missing authorization header', () => {
    expect(() => extractBearerToken(undefined)).toThrow(
      'Missing Authorization header',
    );
  });

  it('rejects non-bearer authorization header', () => {
    expect(() => extractBearerToken(`Basic ${firstToken}`)).toThrow(
      'Invalid Authorization header format',
    );
  });

  it('rejects bearer header without token value', () => {
    expect(() => extractBearerToken('Bearer')).toThrow(
      'Invalid Authorization header format',
    );
  });
});
