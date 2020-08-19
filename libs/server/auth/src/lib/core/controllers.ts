import { randomBytes } from 'crypto';
import { compare, hash } from 'bcryptjs';
import { badImplementation, unauthorized, badRequest } from '@hapi/boom';
import { signAccessToken, signRefreshToken } from './tokens';
import {
  stripPasswordFields,
  createPublicPemFromPrivate,
  isPasswordAllowed,
} from './utils';
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

// export function setupRegisterController<U extends AuthUser, V extends Verify>(
//   config: RegisterController<U, V>
// ): (user: AuthUser) => Promise<AuthUser> {
//   // The 'registration' controller may either include email verification or not so
//   // the Verify model may be undefined. Additionally a password validator may be passed in,
//   // defaults to one in the utils
//   const {
//     User,
//     Verify: VerifyToken,
//     verifyEmail,
//     validatePassword = isPasswordAllowed,
//   } = config;

//   const basicReg = simpleRegistration(User, validatePassword, Verify);

//   if (!VerifyToken) {
//     return basicReg;
//   } else {
//     const sendEmailVerification = verifyUser(VerifyToken, verifyEmail);
//     return (user: AuthUser) => basicReg(user).then(sendEmailVerification);
//   }
// }

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

// export function verifyUser<V extends Verify>(
//   VerificationToken: VerifyModel<V>,
//   verifyEmail: VerifyEmail
// ) {
//   return (user: AuthUser) => {
//     const verificationToken = new VerificationToken({
//       userId: user.id,
//       token: randomBytes(16).toString('hex'),
//     });

//     return Promise.all([
//       verificationToken.save(),
//       verifyEmail(user.email, verificationToken.token),
//     ]).then(() => user);
//   };
// }

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
// export function setupLoginController<U extends AuthUser>(
//   config: LoginController<U>
// ) {
//   const { User } = config;
//   const accessToken = signAccessToken(config);

//   return async (username: string, password: string) => {
//     if (!username || !password)
//       throw unauthorized('Username and password must be provided');

//     const user = await User.findByUsername(username);

//     if (!user || !user.active) throw unauthorized(null, 'Bearer');

//     const valid = await compare(password, user.hashedPassword as string);

//     if (!valid) throw unauthorized(null, 'Bearer');

//     const token = accessToken(user);

//     return {
//       token,
//       expiresIn: config.expireTime,
//     };
//   };
// }

export function setupAuthorizeController<U extends AuthUser, R extends Refresh>(
  config: AuthorizeController<U, R>
) {
  const { User, Refresh: Token } = config;
  const createAccessToken = signAccessToken(config);
  const createRefreshToken = signRefreshToken(config);
  const setRefreshToken = setRefreshTokenCookie(config.production);

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
    setRefreshToken(cookies, refreshToken);

    return {
      token: accessToken,
      expiresIn: config.expireTime,
    };
  };
}

// TODO -> SHOULD THIS RETURN 401 or not?

// a controller that receives a refresh token and returns an access token.
export function setupRefreshAccessTokenController<R extends Refresh>(
  config: RefreshController<R>
) {
  const { Refresh: Token } = config;

  const publicKey = createPublicPemFromPrivate(config.privateKey);
  const verify = verifyRefresh({ ...config, publicKey });
  const createAccessToken = signAccessToken(config);

  return async (refreshToken: string, cookies: Cookies) => {
    if (!refreshToken) throw unauthorized('No token provided');
    // Verify the refresh token. Don't care about decoding it (as we retrieve form DB as well),
    // verify will throw a 401 if incorrect, catch and delete from the db (if exists) before throwing
    try {
      await verify(refreshToken);
    } catch (e) {
      cookies.set('refresh_token');
      await Token.removeByToken(refreshToken);
      throw e;
    }

    const savedToken = await Token.findByToken(refreshToken);

    // No token found
    if (savedToken === null) {
      cookies.set('refresh_token');
      throw unauthorized(null, 'Bearer');
    }

    // revoke refreshToken if user is inactive
    if (savedToken.user.active !== true) {
      await savedToken.remove();
      cookies.set('refresh_token');
      throw unauthorized(null, 'Bearer');
    }

    const accessToken = createAccessToken(savedToken.user);

    return {
      expiresIn: config.expireTime,
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
    cookies.set('refresh_token');

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
