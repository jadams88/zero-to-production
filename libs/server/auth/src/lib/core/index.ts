export { signAccessToken, signRefreshToken, verifyToken } from './tokens';

export {
  setupAuthorizeController,
  setupLoginController,
  setupRefreshAccessTokenController,
  setupRegisterController,
  setupRevokeRefreshTokenController,
  setupVerifyController,
  simpleRegistration,
} from './controllers';

export {
  includeEmailVerification,
  includeRefresh,
  isJWKS,
  createEmailMessage,
  createPublicPemFromPrivate,
  stripPasswordFields,
  isPasswordAllowed,
} from './utils';

export { generateAuthGuardConfig, generateAuthModuleConfig } from './config';

export {
  retrievePublicKeyFromJWKS,
  isActiveUser,
  verifyRefresh,
  verifyUserRole,
} from './authenticate';
