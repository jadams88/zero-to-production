import { randomBytes } from 'crypto';
import { compare, hash } from 'bcryptjs';
import Boom from '@hapi/boom';
import { signAccessToken, signRefreshToken } from './tokens';
import {
  isPasswordAllowed,
  stripPasswordFields,
  createPublicPemFromPrivate,
} from './utils';
import { verifyRefresh } from './authenticate';
import type {
  LoginController,
  VerifyController,
  AuthorizeController,
  RefreshController,
  RevokeController,
  RegistrationWithVerificationController,
  RegistrationConfig,
  AuthUser,
  Refresh,
  Verify,
  AuthUserModel,
  VerifyModel,
  VerifyEmail,
  BasicRegistrationController,
  PasswordValidator,
} from '../types';

export function setupRegisterController<U extends AuthUser>(
  config: BasicRegistrationController<U>
): (user: AuthUser) => Promise<AuthUser>;
export function setupRegisterController<U extends AuthUser, V extends Verify>(
  config: RegistrationWithVerificationController<U, V>
): (user: AuthUser) => Promise<AuthUser>;

export function setupRegisterController<U extends AuthUser, V extends Verify>(
  config: RegistrationConfig<U, V>
): (user: AuthUser) => Promise<AuthUser> {
  // The 'registration' controller may either include email verification or not so
  // the Verify model may be undefined. Additionally a password validator may be passed in,
  // defaults to one in the utils
  const {
    User,
    Verify: VerifyToken,
    verifyEmail,
    validatePassword = isPasswordAllowed,
  } = config as RegistrationWithVerificationController<U, V>;

  const basicReg = simpleRegistration(User, validatePassword);

  if (!VerifyToken) {
    return basicReg;
  } else {
    const sendEmailVerification = verifyUser(VerifyToken, verifyEmail);
    return (user: AuthUser) => basicReg(user).then(sendEmailVerification);
  }
}

export function simpleRegistration<U extends AuthUser>(
  User: AuthUserModel<U>,
  passwordValidator: PasswordValidator
) {
  return async (user: AuthUser) => {
    const password: string = (user as any).password;
    if (!password) Boom.badRequest('No password provided');

    if (!passwordValidator(password))
      throw Boom.badRequest('Password does not meet requirements');

    const currentUser = await User.findByUsername(user.username);
    if (currentUser !== null)
      throw Boom.badRequest('Username is not available');

    const hashedPassword = await hash(password, 10);

    const newUser = new User({
      ...user,
      isVerified: false,
      active: true,
      hashedPassword,
    });

    const savedUser = await newUser.save();

    return stripPasswordFields<AuthUser>(savedUser);
  };
}

export function verifyUser<V extends Verify>(
  VerificationToken: VerifyModel<V>,
  verifyEmail: VerifyEmail
) {
  return (user: AuthUser) => {
    const verificationToken = new VerificationToken({
      userId: user.id,
      token: randomBytes(16).toString('hex'),
    });

    return Promise.all([
      verificationToken.save(),
      verifyEmail(user.email, verificationToken.token),
    ]).then(() => user);
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
    /**
     * Check the user exists and is not already registered
     */
    const user = await User.findByEmail(email);

    if (!user) throw Boom.badRequest('Email address is not available');
    if (user.isVerified) throw Boom.badRequest('User is already registered');

    /**
     * Check the provided Token is valid
     */
    const verificationToken = await Token.findByToken(token);
    if (!verificationToken) throw Boom.badRequest('Token is not valid');

    /**
     * Is the provided token and email a match
     */
    if (verificationToken.userId.toString() !== user.id.toString())
      throw Boom.badRequest('Token does not match email address');

    user.isVerified = true;
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
 *   AuthUserModel: IAuthUserModel;
 *   secret: string;
 *   expireTime: number;
 * }} {
 *   AuthUserModel,
 *   secret,
 *   expireTime
 * }
 */
export function setupLoginController<U extends AuthUser>(
  config: LoginController<U>
) {
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

export function setupAuthorizeController<U extends AuthUser, R extends Refresh>(
  config: AuthorizeController<U, R>
) {
  const { User, Refresh: Token } = config;
  const createAccessToken = signAccessToken(config);
  const createRefreshToken = signRefreshToken(config);

  return async (username: string, password: string) => {
    const user = await User.findByUsername(username);

    if (!user || user.active === false) throw Boom.unauthorized(null, 'Bearer');

    const valid = await compare(password, user.hashedPassword as string);

    if (!valid) throw Boom.unauthorized(null, 'Bearer');

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    const token = new Token({
      user: user.id,
      token: refreshToken,
    });

    await token.save();

    return {
      token: accessToken,
      expiresIn: config.expireTime,
      refreshToken,
    };
  };
}

// a controller that receives a refresh token and returns an access token.
export function setupRefreshAccessTokenController<R extends Refresh>(
  config: RefreshController<R>
) {
  const { Refresh: Token } = config;

  const publicKey = createPublicPemFromPrivate(config.privateKey);
  const verify = verifyRefresh({ ...config, publicKey });
  const createAccessToken = signAccessToken(config);

  return async (username: string, providedToken: string) => {
    // Verify the refresh token. Don't care about decoding it (as we retrieve form DB as well),
    // Just catch and throw an unauthorized error
    // verify will throw a 401 if incorrect
    await verify(providedToken);

    const savedToken = await Token.findByToken(providedToken);

    // No token found
    if (savedToken === null) {
      throw Boom.unauthorized(null, 'Bearer');
    }

    // No user found or matched with given parameters
    if (savedToken.user === null || savedToken.user.username !== username) {
      throw Boom.unauthorized(null, 'Bearer');
    }

    // revoke refreshToken if user is inactive
    if (savedToken.user.active !== true) {
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
export function setupRevokeRefreshTokenController<R extends Refresh>({
  Refresh: Token,
}: RevokeController<R>) {
  return async (token: string) => {
    const refreshToken = await Token.findByToken(token);

    if (refreshToken !== null) {
      await refreshToken.remove();
    }

    return { success: true };
  };
}

export function setupUserAvailableController<U extends AuthUser>(
  config: LoginController<U>
) {
  const { User } = config;

  return async (username: string | undefined) => {
    let isAvailable = false;
    if (username) {
      const resource = await User.findByUsername(username);
      isAvailable = resource === null ? true : false;
    }

    return { isAvailable };
  };
}
