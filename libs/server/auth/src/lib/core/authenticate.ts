import { decode } from 'jsonwebtoken';
import { unauthorized } from '@hapi/boom';
import { koaJwtSecret } from 'jwks-rsa';
// import { createPublicPemFromPrivate } from './auth-utils';
import {
  //   VerifyToken,
  //   SignRefreshToken,
  VerifyTokenJWKS,
  UserModel,
  AuthUser,
  VerifyToken,
  VerifyRefreshToken,
  // VerifyRefreshToken,
} from '../types';
import { verifyToken } from './tokens';
// import { verifyToken } from './tokens';

// export function verifyToken(token: string, config: VerifyToken) {
//   try {
//     return verify(token, config.publicKey, {
//       algorithms: ['RS256'],
//       issuer: config.issuer,
//       audience: config.audience,
//     });
//   } catch (err) {
//     throw unauthorized(null, 'Bearer');
//   }
// }

export function isActiveUser<U extends AuthUser>(User: UserModel<U>) {
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

export function verifyRefreshToken(config: VerifyRefreshToken) {
  // Create a public key from the private key
  // if (!config.publicKey) {
  // config.publicKey = createPublicPemFromPrivate(config.privateKey);
  // }

  return (token: string) => verifyToken(token, config);
}

export function retrievePublicKeyFromJWKS({
  authServerUrl,
  allowHttp = false,
}: VerifyTokenJWKS) {
  const jwksUri = `${authServerUrl}/.well-known/jwks.json`;

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
