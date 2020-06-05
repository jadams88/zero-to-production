import { sign } from 'jsonwebtoken';
import { AccessTokenConfig, RefreshTokenConfig, AuthUser } from '../types';

// A function that returns a singed JWT
export function signAccessToken(config: AccessTokenConfig) {
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

export function signRefreshToken(config: RefreshTokenConfig) {
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
