// Mock the requests the the JWKs
jest.mock('jwks-rsa');
import { koaJwtSecret } from 'jwks-rsa';
import * as Koa from 'koa';
import mongoose from 'mongoose';
import {
  authenticate,
  verifyActiveUser,
  authenticateJWKS,
} from './router-guards';
import { signAccessToken } from '../sign-tokens';
import { MockUserModel } from '../__tests__/user.mock';
import { IUserDocument, IUserModel } from '@ztp/server/core-data';
import {
  privateKey,
  publicKey,
  invalidPrivateKey,
  invalidPublicKey,
} from '../__tests__/rsa-keys';

export function newId() {
  return mongoose.Types.ObjectId().toHexString();
}

const issuer = 'some-issuer';
const audience = 'say-hello!!!';
const keyId = 'key-id';
const expireTime = 1 * 60 * 60 * 1000;
describe('Rest Auth Guards', () => {
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
    } as IUserDocument);
    invalidJwt = signAccessToken({
      privateKey: invalidPrivateKey,
      expireTime,
      issuer,
      keyId,
      audience,
    })({
      id: '1',
    } as IUserDocument);
  });

  describe('authenticate', () => {
    it('should call the next handler if a JWT is provided and is valid', async () => {
      const nextSpy = jest.fn();

      await expect(
        authenticate({ publicKey, issuer, audience })(
          { request: { token: jwt }, state: {} },
          nextSpy
        )
      ).resolves.not.toThrowError();

      expect(nextSpy).toHaveBeenCalled();
    });

    it('should throw 401 Unauthorized if the JWT is not provided', async () => {
      const nextSpy = jest.fn();

      await expect(
        authenticate({ publicKey, issuer, audience })(
          { request: {}, state: {} },
          nextSpy
        )
      ).rejects.toThrowError('Unauthorized');

      expect(nextSpy).not.toHaveBeenCalled();
    });

    it('should throw 401 Unauthorized if the JWT signature is not correct', async () => {
      const nextSpy = jest.fn();

      await expect(
        authenticate({ publicKey, issuer, audience })(
          { request: { token: invalidJwt }, state: {} },
          nextSpy
        )
      ).rejects.toThrowError('Unauthorized');

      expect(nextSpy).not.toHaveBeenCalled();
    });

    it('should throw 401 Unauthorized if the JWT issuer is not correct', async () => {
      const nextSpy = jest.fn();

      await expect(
        authenticate({ publicKey, issuer: 'some-different-issuer', audience })(
          { request: { token: invalidJwt }, state: {} },
          nextSpy
        )
      ).rejects.toThrowError('Unauthorized');

      expect(nextSpy).not.toHaveBeenCalled();
    });

    it('should throw 401 Unauthorized if the JWT audience is not correct', async () => {
      const nextSpy = jest.fn();

      await expect(
        authenticate({ publicKey, issuer, audience: 'wrong-audience' })(
          { request: { token: invalidJwt }, state: {} },
          nextSpy
        )
      ).rejects.toThrowError('Unauthorized');

      expect(nextSpy).not.toHaveBeenCalled();
    });
  });

  describe('authenticateJWKS', () => {
    it('should call the next handler if a valid JWT is provided and signed by the JWKS', async () => {
      const nextSpy = jest.fn();

      (koaJwtSecret as any).mockReturnValueOnce(
        async (token: string) => publicKey
      );

      await expect(
        authenticateJWKS({
          production: false,
          authServerUrl: 'http://some-url',
          issuer,
          audience,
        })({ request: { token: jwt }, state: {} }, nextSpy)
      ).resolves.not.toThrowError();

      expect(nextSpy).toHaveBeenCalled();
      (koaJwtSecret as any).mockReset();
    });

    it('should throw 401 Unauthorized if the JWT is not provided', async () => {
      const nextSpy = jest.fn();

      (koaJwtSecret as any).mockReturnValueOnce(
        async (token: string) => publicKey
      );

      await expect(
        authenticateJWKS({
          production: false,
          authServerUrl: 'http://some-url',
          issuer,
          audience,
        })({ request: {}, state: {} }, nextSpy)
      ).rejects.toThrowError('Unauthorized');

      expect(nextSpy).not.toHaveBeenCalled();
      (koaJwtSecret as any).mockReset();
    });

    it('should throw 401 Unauthorized if the JWKS throws', async () => {
      const nextSpy = jest.fn();

      (koaJwtSecret as any).mockReturnValueOnce(async (token: string) => {
        throw new Error('Error while getting JWKS');
      });

      await expect(
        authenticateJWKS({
          production: false,
          authServerUrl: 'http://some-url',
          issuer,
          audience,
        })({ request: { token: jwt }, state: {} }, nextSpy)
      ).rejects.toThrowError('Unauthorized');

      expect(nextSpy).not.toHaveBeenCalled();
      (koaJwtSecret as any).mockReset();
    });

    it('should throw 401 Unauthorized if the JWKS public key is incorrect', async () => {
      const nextSpy = jest.fn();

      (koaJwtSecret as any).mockReturnValueOnce(
        async (token: string) => invalidPublicKey
      );

      await expect(
        authenticateJWKS({
          production: false,
          authServerUrl: 'http://some-url',
          issuer,
          audience,
        })({ request: { token: jwt }, state: {} }, nextSpy)
      ).rejects.toThrowError('Unauthorized');

      expect(nextSpy).not.toHaveBeenCalled();
      (koaJwtSecret as any).mockReset();
    });

    it('should throw 401 Unauthorized if the JWT issuer is not correct', async () => {
      const nextSpy = jest.fn();

      (koaJwtSecret as any).mockReturnValueOnce(
        async (token: string) => publicKey
      );

      await expect(
        authenticateJWKS({
          production: false,
          authServerUrl: 'http://some-url',
          issuer: 'some-wrong-issuer',
          audience,
        })({ request: { token: jwt }, state: {} }, nextSpy)
      ).rejects.toThrowError('Unauthorized');

      expect(nextSpy).not.toHaveBeenCalled();
      (koaJwtSecret as any).mockReset();
    });

    it('should throw 401 Unauthorized if the JWT audience is not correct', async () => {
      const nextSpy = jest.fn();

      (koaJwtSecret as any).mockReturnValueOnce(
        async (token: string) => publicKey
      );

      await expect(
        authenticateJWKS({
          production: false,
          authServerUrl: 'http://some-url',
          issuer,
          audience: 'wrong-audience',
        })({ request: { token: jwt }, state: {} }, nextSpy)
      ).rejects.toThrowError('Unauthorized');

      expect(nextSpy).not.toHaveBeenCalled();
      (koaJwtSecret as any).mockReset();
    });
  });

  describe('verifyActiveUser', () => {
    it('should call the next handler if a JWT is provided and is valid', async () => {
      const nextSpy = jest.fn();

      const id = newId();
      const mockUser = {
        id,
        active: true,
      } as IUserDocument;

      const spy = jest.spyOn(MockUserModel, 'findById');

      MockUserModel.userToRespondWith = mockUser;
      await expect(
        verifyActiveUser({ User: (MockUserModel as unknown) as IUserModel })(
          ({ user: { sub: id } } as unknown) as Koa.ParameterizedContext,
          nextSpy
        )
      ).resolves.not.toThrowError();

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(id);
      expect(nextSpy).toHaveBeenCalled();

      MockUserModel.reset();
    });

    it('should throw 401 Unauthorized if the User can not be found', async () => {
      const nextSpy = jest.fn();

      const wrongId = newId();

      const mockUser = {
        id: newId(),
        active: true,
      } as IUserDocument;

      const spy = jest.spyOn(MockUserModel, 'findById');

      MockUserModel.userToRespondWith = mockUser;

      await expect(
        verifyActiveUser({ User: (MockUserModel as unknown) as IUserModel })(
          ({ user: { sub: wrongId } } as unknown) as Koa.ParameterizedContext,
          nextSpy
        )
      ).rejects.toThrowError('Unauthorized');

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(wrongId);
      expect(nextSpy).not.toHaveBeenCalled();
    });

    it('should throw 401 Unauthorized if the User is not active', async () => {
      const nextSpy = jest.fn();

      const id = newId();
      const mockUser = {
        id,
        active: false,
      } as IUserDocument;

      const spy = jest.spyOn(MockUserModel, 'findById');

      MockUserModel.userToRespondWith = mockUser;
      await expect(
        verifyActiveUser({ User: (MockUserModel as unknown) as IUserModel })(
          ({ user: { sub: id } } as unknown) as Koa.ParameterizedContext,
          nextSpy
        )
      ).rejects.toThrowError('Unauthorized');

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(id);
      expect(nextSpy).not.toHaveBeenCalled();

      MockUserModel.reset();
    });
  });
});
