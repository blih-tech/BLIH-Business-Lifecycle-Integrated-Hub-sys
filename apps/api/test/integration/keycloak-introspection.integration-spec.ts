import { of } from 'rxjs';
import { KeycloakIntrospectionService } from '../../src/platform/keycloak/keycloak-introspection.service';

describe('KeycloakIntrospectionService (integration)', () => {
  it('calls introspection endpoint and returns response', async () => {
    const httpService = {
      post: jest.fn().mockReturnValue(
        of({
          data: {
            active: true,
            sub: 'user-1',
            scope: 'openid profile',
          },
        }),
      ),
    };

    const service = new KeycloakIntrospectionService(
      httpService as never,
      {
        url: 'http://localhost:8080',
        realm: 'blih',
        clientId: 'client',
        clientSecret: 'secret',
      } as never,
    );

    const result = await service.introspect('access-token', 'blih');

    expect(httpService.post).toHaveBeenCalledTimes(1);
    expect(result.active).toBe(true);
    expect(result.sub).toBe('user-1');
  });
});
