import { verify, decode } from 'jsonwebtoken';
import { unauthorized } from '@hapi/boom';
import { IUserModel } from '@ztp/server/core-data';
import {
  VerifyTokenBaseConfig,
  RefreshTokenConfig,
  JWKSGuardConfig,
} from './auth.interface';
import { koaJwtSecret } from 'jwks-rsa';
import { createPublicPemFromPrivate } from './auth-utils';

export function verifyToken(
  token: string,
  publicKey: string,
  config: VerifyTokenBaseConfig
) {
  try {
    return verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: config.issuer,
      audience: config.audience,
    });
  } catch (err) {
    throw unauthorized(null, 'Bearer');
  }
}

export function isActiveUser(User: IUserModel) {
  return async (id: string | undefined) => {
    const user = await User.findById(id);
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

export function verifyRefreshToken(config: RefreshTokenConfig) {
  // Create a public key from the private key
  const publicKey = createPublicPemFromPrivate(config.privateKey);

  return (token: string) => verifyToken(token, publicKey, config);
}

export function retrievePublicKeyFromJWKS(config: JWKSGuardConfig) {
  const jwksUri = `${config.authServerUrl}/.well-known/jwks.json`;

  const jwtSecret = koaJwtSecret({
    cache: true,
    // cacheMaxEntries: 5, // Default value
    // cacheMaxAge: ms('10h'), // Default value,
    rateLimit: true,
    // jwksRequestsPerMinute: 10, // Default value
    strictSsl: config.production, // strict SSL in production
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
