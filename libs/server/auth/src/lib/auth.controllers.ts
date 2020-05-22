import { randomBytes } from 'crypto';
import { compare, hash } from 'bcryptjs';
import { Types } from 'mongoose';
import Boom from '@hapi/boom';
import { signAccessToken, signRefreshToken } from './sign-tokens';
import {
  LoginControllerConfig,
  RegistrationControllerConfig,
  VerifyControllerConfig,
  AuthorizeControllerConfig,
  RefreshControllerConfig,
  RevokeControllerConfig,
} from './auth.interface';
import { IUser } from '@ztp/data';
import { isPasswordAllowed, userToJSON } from './auth-utils';
import { verifyRefreshToken } from './authenticate';

export function setupRegisterController({
  User,
  VerificationToken,
  verifyEmail,
}: RegistrationControllerConfig) {
  return async (user: IUser) => {
    const password: string = (user as any).password;
    if (!password) Boom.badRequest('No password provided');

    if (!isPasswordAllowed(password))
      throw Boom.badRequest('Password does not meet requirements');

    const currentUser = await User.findByUsername(user.username);
    if (currentUser !== null)
      throw Boom.badRequest('Username is not available');

    user.hashedPassword = await hash(password, 10);

    // Generate the id
    const id = Types.ObjectId();
    const newUser = new User({
      ...user,
      isVerified: false,
      active: true,
      id,
    });

    const verificationToken = new VerificationToken({
      userId: id,
      token: randomBytes(16).toString('hex'),
    });

    const [savedUser] = await Promise.all([
      newUser.save(),
      verificationToken.save(),
      verifyEmail(user.email, verificationToken.token),
    ]);

    return userToJSON<IUser>(savedUser);
  };
}

/**
 *
 *
 * @export
 * @param {IUserModel} User
 * @param {IVerificationTokenModel} VerificationToken
 * @returns Verification Controller
 */
export function setupVerifyController({
  User,
  VerificationToken,
}: VerifyControllerConfig) {
  return async (email: string, token: string) => {
    /**
     * Check the user exists and is not already registered
     */
    const user = await User.findOne({ email }).exec();

    if (!user) throw Boom.badRequest('Email address is not available');
    if (user.isVerified) throw Boom.badRequest('User is already registered');

    /**
     * Check the provided Token is valid
     */
    const verificationToken = await VerificationToken.findOne({ token }).exec();
    if (!verificationToken) throw Boom.badRequest('Token is not valid');

    /**
     * Is the provided token and email a match
     */
    if (verificationToken.userId.toString() !== user.id.toString())
      throw Boom.badRequest('Token does not match email address');

    user.set({ isVerified: true });
    /**
     * Update the user status to valid, and remove the token from the db.
     */
    await Promise.all([user.save(), verificationToken.remove()]);

    return { message: `User with ${user.email} has been verified` };
  };
}

/**
 *  A function that handles logging a user in
 *
 * @export
 * @param {{
 *   userModel: IUserModel;
 *   secret: string;
 *   expireTime: number;
 * }} {
 *   userModel,
 *   secret,
 *   expireTime
 * }
 */
export function setupLoginController(config: LoginControllerConfig) {
  const { User } = config;
  const accessToken = signAccessToken(config);

  return async (username: string, password: string) => {
    const user = await User.findByUsername(username);

    if (!user || !user.active) throw Boom.unauthorized(null, 'Bearer');

    const valid = await compare(password, user.hashedPassword as string);

    if (!valid) throw Boom.unauthorized(null, 'Bearer');

    const token = accessToken(user);

    return {
      token,
      expiresIn: config.expireTime,
    };
  };
}

export function setupAuthorizeController(config: AuthorizeControllerConfig) {
  const { User, RefreshToken } = config;
  const createAccessToken = signAccessToken(config);
  const createRefreshToken = signRefreshToken(config);

  return async (username: string, password: string) => {
    const user = await User.findByUsername(username);

    if (!user || user.active === false) throw Boom.unauthorized(null, 'Bearer');

    const valid = await compare(password, user.hashedPassword as string);

    if (!valid) throw Boom.unauthorized(null, 'Bearer');

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    await RefreshToken.create({
      user: user.id,
      token: refreshToken,
    });

    return {
      token: accessToken,
      expiresIn: config.expireTime,
      refreshToken,
    };
  };
}

// a controller that receives a refresh token and returns an access token.
export function setupRefreshAccessTokenController(
  config: RefreshControllerConfig
) {
  const { RefreshToken } = config;
  const verify = verifyRefreshToken(config);
  const createAccessToken = signAccessToken(config);

  return async (username: string, refreshTokenProvided: string) => {
    // Verify the refresh token. Don't care about decoding it (as we retrieve form DB as well),
    // Just catch and throw an unauthorized error
    try {
      await verify(refreshTokenProvided);
    } catch (err) {
      throw Boom.unauthorized(null, 'Bearer');
    }

    const savedToken = await RefreshToken.findByTokenWithUser(
      refreshTokenProvided
    );
    // No token found
    if (savedToken === null) throw Boom.unauthorized(null, 'Bearer');

    // No user found or matched with given parameters
    if (savedToken.user === null || savedToken.user.username !== username)
      throw Boom.unauthorized(null, 'Bearer');

    // revoke refreshToken if user is inactive
    if (savedToken.user.active === false) {
      await savedToken.remove();
      throw Boom.unauthorized(null, 'Bearer');
    }
    const accessToken = createAccessToken(savedToken.user);

    return {
      token: accessToken,
    };
  };
}

// a controller to revoke a refresh token
export function setupRevokeRefreshTokenController({
  RefreshToken,
}: RevokeControllerConfig) {
  return async (token: string) => {
    const refreshToken = await RefreshToken.findOne({ token }).exec();

    if (refreshToken === null) throw Boom.badRequest();

    await refreshToken.remove();

    return { success: true };
  };
}

export function setupUsernameAvailableController(
  config: LoginControllerConfig
) {
  const { User } = config;

  return async (username: string | undefined) => {
    let isAvailable: boolean;
    if (username) {
      const resource = await User.findByUsername(username);
      isAvailable = !resource ? true : false;
    } else {
      isAvailable = false;
    }

    return { isAvailable };
  };
}
