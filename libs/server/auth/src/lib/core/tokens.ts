import { sign, verify } from 'jsonwebtoken';
import {
  SignAccessToken,
  SignRefreshToken,
  AuthUser,
  VerifyToken,
} from '../types';
import { unauthorized } from '@hapi/boom';

// A function that returns a singed JWT
export function signAccessToken(config: SignAccessToken) {
  return (user: AuthUser) => {
    return sign(
      {
        // Enter additional payload info here
      },
      config.privateKey,
      {
        algorithm: 'RS256',
        subject: user.id.toString(),
        expiresIn: config.expireTime,
        issuer: config.issuer,
        keyid: config.keyId,
        audience: config.audience,
      }
    );
  };
}

export function signRefreshToken(config: SignRefreshToken) {
  return (user: AuthUser) => {
    return sign(
      {
        // add whatever properties you desire here
      },
      config.privateKey,
      {
        algorithm: 'RS256',
        subject: user.id.toString(),
        issuer: config.issuer,
        audience: config.audience,
      }
    );
  };
}

export function verifyToken(token: string, config: VerifyToken) {
  try {
    return verify(token, config.publicKey, {
      algorithms: ['RS256'],
      issuer: config.issuer,
      audience: config.audience,
    });
  } catch (err) {
    throw unauthorized(null, 'Bearer');
  }
}
