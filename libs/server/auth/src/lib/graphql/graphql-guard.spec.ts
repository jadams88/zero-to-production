import { GraphQLResolveInfo } from 'graphql';
// Mock the requests the the JWKs
jest.mock('jwks-rsa');
import { koaJwtSecret } from 'jwks-rsa';
import {
  authenticated,
  authenticatedJWKS,
  verifyActiveUser,
  TResolver,
} from './graphql-guards';
import { signAccessToken } from '../core/tokens';
import { MockAuthUserModel } from '../__tests__/user.mock';
import {
  privateKey,
  invalidPrivateKey,
  publicKey,
  invalidPublicKey,
} from '../__tests__/rsa-keys';
import { AuthUser, AuthUserModel } from '../types';

export function newId() {
  return Math.random().toString();
}

const noOpNext: TResolver = async (src, args, ctx, info) => {};

const issuer = 'some-issuer';
const audience = 'say-hello!!!';
const keyId = 'key-id';
const expireTime = 1 * 60 * 60 * 1000;

describe('GraphQL - Auth Guards', () => {
  let jwt: string;
  let invalidJwt: string;

  beforeAll(() => {
    jwt = signAccessToken({
      privateKey,
      expireTime,
      issuer,
      audience,
      keyId,
    })({
      id: '1',
    } as AuthUser);
    invalidJwt = signAccessToken({
      privateKey: invalidPrivateKey,
      expireTime,
      issuer,
      audience,
      keyId,
    })({
      id: '1',
    } as AuthUser);
  });

  describe('authenticated', () => {
    it('should not throw an error if a JWT is provided and is valid', async () => {
      await expect(
        authenticated({ publicKey, issuer, audience })(noOpNext)(
          {},
          {},
          { state: {}, token: jwt },
          {} as GraphQLResolveInfo
        )
      ).resolves.not.toThrowError();
    });

    it('should throw 401 Unauthorized if the JWT is not provided', async () => {
      await expect(
        authenticated({ publicKey, issuer, audience })(noOpNext)(
          {},
          {},
          {},
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrowError();
    });

    it('should throw 401 Unauthorized if the JWT signature is not correct', async () => {
      await expect(
        authenticated({ publicKey, issuer, audience })(noOpNext)(
          {},
          {},
          { token: invalidJwt },
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrowError();
    });

    it('should throw 401 Unauthorized if the JWT issuer is not correct', async () => {
      await expect(
        authenticated({
          publicKey,
          issuer: 'some-different-issuer',
          audience,
        })(noOpNext)({}, {}, { token: invalidJwt }, {} as GraphQLResolveInfo)
      ).rejects.toThrowError();
    });

    it('should throw 401 Unauthorized if the JWT audience is not correct', async () => {
      await expect(
        authenticated({
          publicKey,
          issuer,
          audience: 'wrong-audience',
        })(noOpNext)({}, {}, { token: invalidJwt }, {} as GraphQLResolveInfo)
      ).rejects.toThrowError();
    });
  });

  describe('authenticatedJWKS', () => {
    it('should call the next handler if a valid JWT is provided and signed by the JWKS', async () => {
      (koaJwtSecret as any).mockReturnValueOnce(
        async (token: string) => publicKey
      );

      await expect(
        authenticatedJWKS({
          allowHttp: true,
          authServerHost: 'http://some-url',
          issuer,
          audience,
        })(noOpNext)(
          {},
          {},
          { state: {}, token: jwt },
          {} as GraphQLResolveInfo
        )
      ).resolves.not.toThrowError();

      (koaJwtSecret as any).mockReset();
    });

    it('should throw 401 Unauthorized if the JWT is not provided', async () => {
      (koaJwtSecret as any).mockReturnValueOnce(
        async (token: string) => publicKey
      );

      await expect(
        authenticatedJWKS({
          allowHttp: true,
          authServerHost: 'http://some-url',
          issuer,
          audience,
        })(noOpNext)({}, {}, {}, {} as GraphQLResolveInfo)
      ).rejects.toThrowError('Unauthorized');

      (koaJwtSecret as any).mockReset();
    });

    it('should throw 401 Unauthorized if the JWKS throws', async () => {
      (koaJwtSecret as any).mockReturnValueOnce(async (token: string) => {
        throw new Error('Error while getting JWKS');
      });

      await expect(
        authenticatedJWKS({
          allowHttp: true,
          authServerHost: 'http://some-url',
          issuer,
          audience,
        })(noOpNext)(
          {},
          {},
          { state: {}, token: jwt },
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrowError('Unauthorized');

      (koaJwtSecret as any).mockReset();
    });

    it('should throw 401 Unauthorized if the JWKS public key is incorrect', async () => {
      (koaJwtSecret as any).mockReturnValueOnce(
        async (token: string) => invalidPublicKey
      );

      await expect(
        authenticatedJWKS({
          allowHttp: true,
          authServerHost: 'http://some-url',
          issuer,
          audience,
        })(noOpNext)(
          {},
          {},
          { state: {}, token: jwt },
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrowError('Unauthorized');

      (koaJwtSecret as any).mockReset();
    });

    it('should throw 401 Unauthorized if the JWT issuer is not correct', async () => {
      (koaJwtSecret as any).mockReturnValueOnce(
        async (token: string) => publicKey
      );

      await expect(
        authenticatedJWKS({
          allowHttp: true,
          authServerHost: 'http://some-url',
          issuer: 'some-wrong-issuer',
          audience,
        })(noOpNext)(
          {},
          {},
          { state: {}, token: jwt },
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrowError('Unauthorized');

      (koaJwtSecret as any).mockReset();
    });

    it('should throw 401 Unauthorized if the JWT audience is not correct', async () => {
      (koaJwtSecret as any).mockReturnValueOnce(
        async (token: string) => publicKey
      );

      await expect(
        authenticatedJWKS({
          allowHttp: true,
          authServerHost: 'http://some-url',
          issuer,
          audience: 'wrong-audience',
        })(noOpNext)(
          {},
          {},
          { state: {}, token: jwt },
          {} as GraphQLResolveInfo
        )
      ).rejects.toThrowError('Unauthorized');

      (koaJwtSecret as any).mockReset();
    });
  });

  describe('verifyActiveUser', () => {
    it('should not throw an error if the user is present and active.', async () => {
      const id = newId();
      const mockUser = {
        id,
        active: true,
      } as AuthUser;

      const spy = jest.spyOn(MockAuthUserModel, 'findByUserId');

      const ctx = { user: { sub: id } };
      MockAuthUserModel.userToRespondWith = mockUser;

      await expect(
        verifyActiveUser({
          User: (MockAuthUserModel as unknown) as AuthUserModel<AuthUser>,
        })(noOpNext)({}, {}, ctx, {} as GraphQLResolveInfo)
      ).resolves.not.toThrowError();

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(id);
      // The ctx.user property will be replaced
      expect((ctx.user as any).id).toEqual(mockUser.id);
      expect((ctx.user as any).active).toEqual(mockUser.active);

      MockAuthUserModel.reset();
    });

    it('should throw 401 Unauthorized if the user can not be found', async () => {
      const id = newId();
      const spy = jest.spyOn(MockAuthUserModel, 'findByUserId');

      const ctx = { user: { sub: id } };
      MockAuthUserModel.userToRespondWith = null;

      await expect(
        verifyActiveUser({
          User: (MockAuthUserModel as unknown) as AuthUserModel<AuthUser>,
        })(noOpNext)({}, {}, ctx, {} as GraphQLResolveInfo)
      ).rejects.toThrowError('Unauthorized');

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(id);
      expect((ctx.user as any).id).not.toBeDefined();

      MockAuthUserModel.reset();
    });

    it('should throw 401 Unauthorized if the user is not active', async () => {
      const id = newId();
      const mockUser = {
        id,
        active: false,
      } as AuthUser;

      const spy = jest.spyOn(MockAuthUserModel, 'findByUserId');

      const ctx = { user: { sub: id } };
      MockAuthUserModel.userToRespondWith = mockUser;

      await expect(
        verifyActiveUser({
          User: (MockAuthUserModel as unknown) as AuthUserModel<AuthUser>,
        })(noOpNext)({}, {}, ctx, {} as GraphQLResolveInfo)
      ).rejects.toThrowError('Unauthorized');

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(id);
      expect(ctx.user).not.toEqual(mockUser);

      MockAuthUserModel.reset();
    });
  });
});
