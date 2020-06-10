import { decode } from 'jsonwebtoken';
import { unauthorized } from '@hapi/boom';
import { koaJwtSecret } from 'jwks-rsa';
import { VerifyJWKS, AuthUserModel, AuthUser, VerifyRefresh } from '../types';
import { verifyToken } from './tokens';

export function isActiveUser<U extends AuthUser>(User: AuthUserModel<U>) {
  return async (id: string | undefined) => {
    const user = await User.findByUserId(id);
    if (!user || !user.active) throw unauthorized(null, 'Bearer');
    return user;
  };
}

export function verifyUserRole(requiredRole: string) {
  return (actualRole: string) => {
    try {
      if (actualRole !== requiredRole) {
        throw unauthorized(`you must have ${requiredRole} role`);
      }
    } catch (err) {
      throw unauthorized(null, 'Bearer');
    }
  };
}

export const verifyRefresh = (config: VerifyRefresh) => (token: string) =>
  verifyToken(token, config);

export function retrievePublicKeyFromJWKS({
  authServerHost,
  allowHttp = false,
}: VerifyJWKS) {
  const jwksUri = `${authServerHost}/.well-known/jwks.json`;

  const jwtSecret = koaJwtSecret({
    cache: true,
    // cacheMaxEntries: 5, // Default value
    // cacheMaxAge: ms('10h'), // Default value,
    rateLimit: true,
    // jwksRequestsPerMinute: 10, // Default value
    strictSsl: !allowHttp, // strict SSL in production
    jwksUri,
  });

  return async (jwt: string) => {
    try {
      const { header } = decode(jwt, {
        complete: true,
      }) as { header: { alg: string; kid: string; type: 'JWT' } };

      // must await the call to jwtSecret so that if it errors, it is caught here
      return await jwtSecret(header);
    } catch (err) {
      throw unauthorized(null, 'Bearer');
    }
  };
}
