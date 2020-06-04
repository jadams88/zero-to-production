import Router from '@koa/router';
// @ts-ignore
import { pem2jwk } from 'pem-jwk';
import { JWKSRouteConfig } from '../auth.interface';

// https://auth0.com/docs/jwks
// https://YOUR_DOMAIN/.well-known/jwks.json

const END_POINT = '/.well-known/jwks.json';

export function createJsonWebKeySetRoute(
  { publicKey, keyId }: JWKSRouteConfig,
  router: Router
) {
  const jwk: object = pem2jwk(publicKey, {
    alg: 'RS256',
    use: 'sig',
    kid: keyId,
  });

  router.get(END_POINT, async (ctx) => {
    ctx.body = { keys: [jwk] };
  });
}
