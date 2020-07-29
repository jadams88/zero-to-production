import { randomBytes } from 'crypto';
import { compare, hash } from 'bcryptjs';
import { badImplementation, unauthorized, badRequest } from '@hapi/boom';
import { signAccessToken, signRefreshToken } from './tokens';
import { stripPasswordFields, isPasswordAllowed } from './utils';
import { verifyRefresh } from './authenticate';
import type {
  VerifyController,
  AuthorizeController,
  RefreshController,
  RevokeController,
  RegisterController,
  AuthUser,
  Refresh,
  Verify as VerifyM,
} from '../types';
import Cookies from 'cookies';
import { setRefreshTokenCookie } from './cookies';

export function setupRegisterController<U extends AuthUser, V extends VerifyM>({
  User,
  Verify,
  verifyEmail,
  validatePassword = isPasswordAllowed,
}: RegisterController<U, V>) {
  return async (user: AuthUser) => {
    const password: string = (user as any).password;
    if (!password) badRequest('No password provided');

    if (!validatePassword(password))
      throw badRequest('Password does not meet requirements');

    const currentUser = await User.findByUsername(user.username);
    if (currentUser !== null) throw badRequest('Username is not available');

    const hashedPassword = await hash(password, 13);

    const newUser = new User({
      ...user,
      isVerified: false,
      active: true,
      hashedPassword,
    });

    const savedUser = await newUser.save();

    const verificationToken = new Verify({
      userId: savedUser.id,
      token: randomBytes(16).toString('hex'),
    });

    await Promise.all([
      verificationToken.save(),
      verifyEmail(user.email, verificationToken.token),
    ]);

    return stripPasswordFields<AuthUser>(savedUser);
  };
}

/**
 *
 *
 * @export
 * @param {IAuthUserModel} User
 * @param {IVerifyModel} VerificationToken
 * @returns Verification Controller
 */
export function setupVerifyController({
  User,
  Verify: Token,
}: VerifyController<any, any>) {
  return async (email: string, token: string) => {
    if (!email || !token)
      throw unauthorized('email address and token must be provided');

    /**
     * Check the user exists and is not already registered
     */
    const user = await User.findByEmail(email);

    if (!user) throw badRequest('Email address is not available');
    if (user.isVerified) throw badRequest('User is already registered');

    /**
     * Check the provided Token is valid
     */
    const verificationToken = await Token.findByToken(token);
    if (!verificationToken) throw badRequest('Token is not valid');

    /**
     * Is the provided token and email a match
     */
    if (verificationToken.userId.toString() !== user.id.toString())
      throw badRequest('Token does not match email address');

    user.isVerified = true;
    /**
     * Update the user status to valid, and remove the token from the db.
     */
    await Promise.all([user.save(), verificationToken.remove()]);

    return { message: `User with ${user.email} has been verified` };
  };
}

export function setupAuthorizeController<U extends AuthUser, R extends Refresh>(
  config: AuthorizeController<U, R>
) {
  const { User, Refresh: Token } = config;
  const createAccessToken = signAccessToken(config.access);
  const createRefreshToken = signRefreshToken(config.refresh);

  return async (username: string, password: string, cookies: Cookies) => {
    if (!username || !password)
      throw unauthorized('Username and password must be provided');

    const user = await User.findByUsername(username);

    if (!user || user.active === false) throw unauthorized(null, 'Bearer');

    const valid = await compare(password, user.hashedPassword as string);

    if (!valid) throw unauthorized(null, 'Bearer');

    /* 1 if successful */
    const { ok } = await Token.removeUserTokens(user.id as string);

    if (ok !== 1) throw badImplementation();

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    const token = new Token({
      user: user.id,
      token: refreshToken,
    });

    await token.save();

    // Set the refresh token on the header
    setRefreshTokenCookie(cookies, refreshToken);

    return {
      token: accessToken,
      expiresIn: config.access.expireTime,
    };
  };
}

// a controller that receives a refresh token and returns an access token.
export function setupRefreshAccessTokenController<R extends Refresh>(
  config: RefreshController<R>
) {
  const { Refresh: Token } = config;

  // const publicKey = createPublicPemFromPrivate(config.privateKey);
  const verify = verifyRefresh(config.refresh);
  const signAccess = signAccessToken(config.access);

  return async (refreshToken: string, cookies: Cookies) => {
    if (!refreshToken) return { expiresIn: null, token: null };

    // Verify the refresh token. Don't care about decoding it (as we retrieve form DB as well),
    // verify will throw a 401 if incorrect, catch and delete from the db (if exists) before returning
    try {
      await verify(refreshToken);
    } catch (e) {
      setRefreshTokenCookie(cookies);
      await Token.removeByToken(refreshToken);
      return { expiresIn: null, token: null };
    }

    const savedToken = await Token.findByToken(refreshToken);

    // No token found
    if (savedToken === null) {
      setRefreshTokenCookie(cookies);
      return { expiresIn: null, token: null };
    }

    // revoke refreshToken if user is inactive
    if (savedToken.user.active !== true) {
      await savedToken.remove();
      setRefreshTokenCookie(cookies);
      return { expiresIn: null, token: null };
    }

    const accessToken = signAccess(savedToken.user);

    return {
      expiresIn: config.access.expireTime,
      token: accessToken,
    };
  };
}

// a controller to revoke a refresh token
export function setupRevokeRefreshTokenController<R extends Refresh>({
  Refresh: Token,
}: RevokeController<R>) {
  return async (token: string, cookies: Cookies) => {
    // delete the cookie regardless
    setRefreshTokenCookie(cookies);

    if (!token) {
      return { success: false };
    }
    const refreshToken = await Token.findByToken(token);

    if (refreshToken !== null) {
      await refreshToken.remove();
    }

    return { success: true };
  };
}
