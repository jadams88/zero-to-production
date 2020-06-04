import { sign } from 'jsonwebtoken';
import { AccessTokenConfig, RefreshTokenConfig, User } from './auth.interface';

// A function that returns a singed JWT
export function signAccessToken(config: AccessTokenConfig) {
  return (user: User) => {
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
  return (user: User) => {
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
