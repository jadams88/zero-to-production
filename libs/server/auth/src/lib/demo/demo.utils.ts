import { createHash } from 'crypto';
import { IUserModel } from '@ztp/server/core-data';
import { ServerAuthConfig } from '../auth.interface';
import { DemoAuthModuleConfig } from './demo.interface';
import { createPublicPemFromPrivate } from '../auth-utils';

export function generateDemoAuthModuleConfig(
  User: IUserModel,
  config: ServerAuthConfig
): DemoAuthModuleConfig {
  const { publicKey, privateKey } = config.accessToken;
  const pubKey = publicKey ? publicKey : createPublicPemFromPrivate(privateKey);

  const keyId = createHash('md5').update(pubKey).digest('hex');

  return {
    jwks: config.jwksRoute
      ? {
          publicKey: pubKey,
          keyId,
        }
      : undefined,
    login: { User, ...config.accessToken, keyId },
    register: { User, ...config.accessToken },
  };
}
